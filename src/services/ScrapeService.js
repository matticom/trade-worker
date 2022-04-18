import { sleep } from '../tools/General';
import moment from 'moment';
import {
   ASSET_POLLING_FUZZY_LENGTH_MSEC,
   ASSET_POLLING_INTERVAL_LENGTH_MSEC,
   DE_FORMAT,
   EN_FORMAT,
   TIME_AGG_LEVEL,
} from '../constants';
import { getAssetByKey, getAssetKey, getChartDataPointCollection } from '../db/ModelService';
import { assets } from '../Assets';
import { createAssetEmitter, removeAllJobFromAssetEmitter, sendRefresh } from '../jobs/AssetEmitter';
import { AssetCollection, TradingPlatformCollection } from '../db/schemas';

const valueRegex = /[^0-9]*([0-9,.]*)[^0-9]*/;

const puppeteer = require('puppeteer-extra');
// const Url = require('url-parse');
const proxy_check = require('proxy-check');
const proxyChecker = require('proxy-checker');
const fs = require('fs');
var request = require('request');
var promiseRequest = require('request-promise-native');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const userAgent = require('user-agents');

// const httpHeader = {
//    Accept:
//       'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//    ['Accept-Encoding']: 'gzip, deflate, br',
//    ['Accept-Language']: 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
//    Dnt: '1',
//    // Host: 'httpbin.org',
//    Referer: 'https://www.google.com/',
//    ['Sec-Ch-Ua']: '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
//    ['Sec-Ch-Ua-Mobile']: '?0',
//    ['Sec-Fetch-Dest']: 'document',
//    ['Sec-Fetch-Mode']: 'navigate',
//    ['Sec-Fetch-Site']: 'cross-site',
//    ['Sec-Fetch-User']: '?1',
//    ['Upgrade-Insecure-Requests']: '1',
//    ['User-Agent']:
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
// };

const PRICE_SELECTOR = '#last';
const PRICE_SELECTOR_GOOGLE = '#SIvCob';
const PRICE_SELECTOR_LS =
   '#chart5push > span.mid.quote.visible-sm-block.visible-xs-inline.visible-md-inline.visible-lg-inline > span';
let browser = null;
export let activePages = {};

let IPs = [];
let PORTS = [];

let retry = 0;
let MAX_RETRIES = 5;
let ipIsBeingChanged = false;
let serviceStopped = false;

// export async function getPageHTML(pageUrl) {

//    const browser = await puppeteer.launch();
//    const page = await browser.newPage();
//    await page.goto('https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037');
//    const pageHTML = await page.evaluate(
//       'new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML',
//    );

//    setInterval(async () => {

//       console.log('searchValue :>> ', searchValue);
//    }, 10000);
//    await browser.close();
//    // console.log('pageHTML :>> ', pageHTML);
//    return pageHTML;
// }

export async function startBrowser(proxyIP, proxyPort) {
   if (proxyIP !== undefined) {
      browser = await puppeteer.launch({ args: [`--proxy-server=${proxyIP}:${proxyPort}`] });
   } else {
      browser = await puppeteer.launch({
         dumpio: false,
      });
   }
}

export async function closeBrowser() {
   activePages = {};
   browser.close();
}
export async function getProxyIPs() {
   console.error('Get Proxy IP ....');
   const page = await browser.newPage();
   // page.setExtraHTTPHeaders(httpHeader);
   try {
      await page.goto('https://www.sslproxies.org/');
      const ipTagHandle = await page.$$(
         '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(1)',
      );
      IPs = await Promise.all(ipTagHandle.map((el) => el.evaluate((el) => el.innerText)));
      const portTagHandle = await page.$$(
         '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(2)',
      );
      PORTS = await Promise.all(portTagHandle.map((el) => el.evaluate((el) => el.innerText)));
      if (IPs.length > 0) {
         console.log('GGGGGGGgot IPs :>> ');
      }
   } catch (error) {
      console.log('error :>> ', error);
   }

   // setInterval(async () => {
   //    emitter.emit('refresh');
   // }, 10000);
}

export async function startObservationJob() {
   await startBrowser();

   for (let index = 0; index < assets.length; index++) {
      const { name, symbol, currency, url, selector, separatorChar, tradingPlatform } = assets[index];
      const assetKey = getAssetKey(name, symbol, currency);
      const MinuteCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.MINUTE);
      createAssetEmitter(assetKey);

      console.log(`start observation of : ${url} (${name}_${currency})`);
      await startPageObservation(
         assetKey,
         url,
         selector,
         tradingPlatform,
         storeNewPriceInDb(MinuteCollection, separatorChar),
      );
      await sleep(2000);
   }
}

export async function startAssetPriceRecording(assetKey) {
   if (browser === null) {
      await startBrowser();
   }

   const { url, selector, separatorChar, tradingPlatform } = await getAssetByKey(assetKey);
   const MinuteCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.MINUTE);
   createAssetEmitter(assetKey);

   await startPageObservation(
      assetKey,
      url,
      selector,
      tradingPlatform,
      storeNewPriceInDb(MinuteCollection, separatorChar),
   );
}

export async function stopAssetPriceRecording(assetKey) {
   removeAllJobFromAssetEmitter(assetKey);
   stopPageObservation(assetKey);
}

function storeNewPriceInDb(MinuteCollection, separatorChar) {
   return async (price, date) => {
      let formatedPrice = price.replace(separatorChar, '');
      if (separatorChar === DE_FORMAT) {
         formatedPrice = formatedPrice.replace(EN_FORMAT, DE_FORMAT);
      }
      // console.log('price :>> ', formatedPrice);
      const newValue = new MinuteCollection({ value: Number.parseFloat(formatedPrice), date });
      await newValue.save();
   };
}

export async function startPageObservation(assetKey, url, selector, platform, dbStoreFn) {
   try {
      // console.log(`start observation of : ${url}`);
      const page = await browser.newPage();
      await page.setUserAgent(userAgent.toString());
      // page.setExtraHTTPHeaders(httpHeader);
      // console.log((await page.goto('https://example.org/')).request().headers());
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // let html = await page.content();
      // console.log('html :>> ', html);
      await page.waitForSelector(selector);
      const elementHandle = await page.$(selector);

      activePages[assetKey] = { assetKey, price: 0, intervalId: null, selector, url, active: true, platform };
      activePages[assetKey].intervalId = setInterval(async () => {
         try {
            await sleep(Math.random() * ASSET_POLLING_FUZZY_LENGTH_MSEC);
            await fetchPrice(assetKey, url, page, elementHandle, platform, dbStoreFn);
            sendRefresh(assetKey);
         } catch (error) {
            console.log('fetch error :>> ', error);
         }
      }, ASSET_POLLING_INTERVAL_LENGTH_MSEC);
   } catch (error) {
      console.log('another error :>> ', error);
   }
}

async function fetchPrice(assetKey, url, page, elementHandle, platform, dbStoreFn) {
   try {
      if (await shouldAskForPrice(platform)) {
         // if (true) {
         console.log(`new fetch for ${url} :>> `, moment().format('HH:mm:ss SSS'));
         // await page.reload();
         const unformatedPrice = await page.evaluate((selected) => selected.innerHTML, elementHandle);
         // console.log('unformatedPrice :>> ', unformatedPrice);
         const foundValue = unformatedPrice.match(valueRegex);
         const price = foundValue[1];
         console.log('price :>> ', price);
         const date = moment().toDate();
         activePages[assetKey].price = price;
         activePages[assetKey].date = date;
         if (dbStoreFn !== undefined) {
            await dbStoreFn(price, date);
         }
      } else {
         console.log('Exchange is closed');
      }
   } catch (error) {
      console.log('emitter error :>> ', error);
      // stopAllPageObservations();
      // console.log('before stop :>> ', ipIsBeingChanged);
      // if (!ipIsBeingChanged) {
      //    ipIsBeingChanged = true;
      //    await changeIP();
      //    await restartObservations();
      //    ipIsBeingChanged = false;
      // }
   }
}

export async function shouldAskForPrice(platformName) {
   // console.log('platform :>> ', platformName);
   const platform = await TradingPlatformCollection.findOne({ name: platformName });
   const { tradeWeekend, tradeAnyTime } = platform;
   if (tradeAnyTime) return true;

   const now = moment();
   console.log('now :>> ', now.format());
   const dayOfWeek = now.isoWeekday();
   const dateString = now.format('DD.MM.YYYY');

   // what about holidays???
   if (dayOfWeek > 5) {
      // Sat-Sun
      if (!tradeWeekend) {
         return false;
      } else {
         const { tradeStartSat, tradeEndSat, tradeStartSun, tradeEndSun } = platform;
         if (dayOfWeek === 6) {
            // Sat
            const momentTradeStartSat = moment(`${dateString} ${tradeStartSat}`, 'DD.MM.YYYY HH:mm');
            const momentTradeEndSat = moment(`${dateString} ${tradeEndSat}`, 'DD.MM.YYYY HH:mm');
            return now.isSameOrAfter(momentTradeStartSat) && now.isSameOrBefore(momentTradeEndSat);
         } else {
            // Sun
            const momentTradeStartSun = moment(`${dateString} ${tradeStartSun}`, 'DD.MM.YYYY HH:mm');
            const momentTradeEndSun = moment(`${dateString} ${tradeEndSun}`, 'DD.MM.YYYY HH:mm');
            return now.isSameOrAfter(momentTradeStartSun) && now.isSameOrBefore(momentTradeEndSun);
         }
      }
   } else {
      // Mon-Fri
      const { tradeStartMonFri, tradeEndMonFri } = platform;
      const momentTradeStart = moment(`${dateString} ${tradeStartMonFri}`, 'DD.MM.YYYY HH:mm');
      const momentTradeEnd = moment(`${dateString} ${tradeEndMonFri}`, 'DD.MM.YYYY HH:mm');
      return now.isSameOrAfter(momentTradeStart) && now.isSameOrBefore(momentTradeEnd);
   }
}

export async function monitoringObservationHealth() {
   try {
      setInterval(() => {
         let hasObservationIssues = false;
         Object.keys(activePages).forEach((assetKey) => {
            if (!activePages[assetKey].active) {
               hasObservationIssues = true;
            }
         });
         if (hasObservationIssues) {
            console.log(
               'activePages :>> ',
               Object.keys(activePages).map((assetKey) => ({
                  ...activePages[assetKey],
                  intervalId: activePages[assetKey].intervalId !== null,
               })),
            );
         }
      }, 5000);
   } catch (error) {
      console.log('Monitoring error :>> ', error);
   }
}

function stopAllPageObservations() {
   Object.keys(activePages).forEach((assetKey) => {
      stopPageObservation(assetKey, true);
   });
}

export function stopPageObservation(assetKey, pause = false) {
   clearInterval(activePages[assetKey].intervalId);
   console.log('assetKey :>> ', assetKey);
   if (pause) {
      activePages[assetKey] = {
         price: 0,
         intervalId: null,
         selector: activePages[assetKey].selector,
         url,
         active: false,
      };
   } else {
      delete activePages[assetKey];
   }
}

async function changeIP() {
   try {
      await browser.close();
      retry++;
      console.log('Change IP :>> ', retry);
      if (retry < MAX_RETRIES) {
         await startBrowser();
         await getProxyIPs();
         const proxyIP = IPs[Math.floor(Math.random() * IPs.length)];
         await browser.close();
         await startBrowser(proxyIP);
      } else {
         serviceStopped = true;
      }
   } catch (error) {
      console.log('Error occurred while changing IP :>> ', error);
      await sleep(2000);
      await changeIP();
   }
}

async function restartObservations() {
   try {
      console.log('Restart observations :>> ', Object.keys(activePages).length);
      for (let index = 0; index < Object.keys(activePages).length; index++) {
         const assetKey = Object.keys(activePages)[index];
         console.log('assetKey :>> ', assetKey);
         console.log('activePages[assetKey] :>> ', activePages[assetKey]);
         const { selector, active } = activePages[assetKey];
         if (!active) {
            console.log('!active :>> ', !active);
            console.log('!ipIsBeingChanged :>> ', !ipIsBeingChanged);
            await startPageObservation(activePages[assetKey].url, selector);
            await sleep(5000);
         }
      }
   } catch (error) {
      console.log('error while restarting :>> ', error);
   }
}

export function isServiceOnline() {
   return !serviceStopped;
}

async function checkProxy(ip, port) {
   // console.log('ip :>> ', ip);
   // console.log('port :>> ', port);
   try {
      return await proxy_check({ host: ip, port: +port });
   } catch (error) {
      // console.log('error :>> ', error);
      return false;
   }
}

async function checkProxy2() {
   const contentLines = IPs.map((ip, idx) => `${ip}:${PORTS[idx]}`);
   const content = contentLines.slice(0, 10).join('\n');

   fs.writeFile(`proxy.txt`, content, (err) => {
      if (err) {
         throw err;
      }
      console.log('proxy is saved.');
   });
   try {
      proxyChecker.checkProxiesFromFile(
         // The path to the file containing proxies
         'proxy.txt',
         {
            // the complete URL to check the proxy
            url: 'https://www.ls-tc.de/',
            // an optional regex to check for the presence of some text on the page
            regex: /.*Impressum.*/,
         },
         // Callback function to be called after the check
         function (host, port, ok, statusCode, err) {
            console.log(host + ':' + port + ' => ' + ok + ' (status: ' + statusCode + ', err: ' + err + ')');
         },
      );
   } catch (error) {
      console.log('error :>> ', error);
   }
}

export async function test() {
   try {
      await startBrowser();

      await startPageObservation('https://www.ls-tc.de/de/etf/52412', PRICE_SELECTOR_LS);
      // await startPageObservation('https://www.google.de', PRICE_SELECTOR_GOOGLE);
      await sleep(2000);
      await startPageObservation('https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037', PRICE_SELECTOR);

      setInterval(() => {
         console.log('Price Gold:>> ', activePages['https://www.ls-tc.de/de/etf/52412'].price);
         console.log('Price Grth20:>> ', activePages['https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037'].price);
         let hasObservationIssues = false;
         Object.keys(activePages).forEach((assetKey) => {
            if (!activePages[assetKey].active) {
               hasObservationIssues = true;
            }
         });
         if (hasObservationIssues) {
            console.log(
               'activePages :>> ',
               Object.keys(activePages).map((assetKey) => ({
                  ...activePages[assetKey],
                  intervalId: activePages[assetKey].intervalId !== null,
               })),
            );
         }

         // console.log('ipIsBeingChanged :>> ', ipIsBeingChanged);
      }, 3000);

      // await startBrowser();
      // await getProxyIPs();
      // const responses = await Promise.all(IPs.map((ip, idx) => checkProxy(ip, PORTS[idx])));
      // const overview = responses
      //    .map((res, idx) => ({ ip: IPs[idx], port: PORTS[idx], alive: res }))
      //    .filter((proxy) => proxy.alive === true);
      // console.log('overview :>> ', overview);
      // const secChecker = await Promise.all(
      //    IPs.map((ip, idx) => checkProxyExt(ip, PORTS[idx], 'https://www.ls-tc.de/', /.*Impressum.*/)),
      // );
      // console.log('secChecker :>> ', secChecker);
      // const result = await checkProxyExt(overview[0].ip, overview[0].port, 'https://www.ls-tc.de/', /.*Impressum.*/);
      // checkProxy2();

      // const responses2 = await Promise.all(
      //    IPs.map((ip, idx) => {
      //       const res = checkProxy2(ip, PORTS[idx]);
      //       console.log('res :>> ', res);
      //       return res;
      //    }),
      // );
      // console.log('responses2 :>> ', responses2);

      // for (let index = 0; index < IPs.length; index++) {
      //    const ip = IPs[index];
      //    const port = PORTS[index];
      //    const res = await checkProxy(ip, port);
      //    console.log('res :>> ', res);
      //    responses.push(res);
      // }
      // const overview2 = responses2.map((res, idx) => ({ ip: IPs[idx], port: PORTS[idx], alive: res }));
      // console.log('overview2 :>> ', overview2);
   } catch (error) {
      console.log('test error :>> ', error);
   }
}

async function checkProxyExt(host, port, testUrl, regex) {
   var proxyRequest = promiseRequest.defaults({
      proxy: 'https://' + host + ':' + port,
   });
   try {
      const res = await proxyRequest(testUrl);
      if (!res.body || (regex && !regex.exec(res.body))) {
         return "Body doesn't match the regex";
      } else {
         console.log('Worrrrkkkkkkkkkkeeddddd :>> ');
         return true;
      }
   } catch (error) {
      if (error) {
         console.log('error :>> ', error.message);
         console.log('host :>> ', host);
      }
      return false;
   }
}
