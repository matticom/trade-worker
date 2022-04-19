const { assets } = require('./Assets');
const { getAssetKey } = require('./db/ModelService');
const { addJob, removeAllAssetJobs, removeAssetJob } = require('./jobs/jobs');
const { sleep } = require('./tools/General');
const moment = require('moment-timezone');
const { TZ_BERLIN } = require('./constants');
const { getHolidays, isHoliday } = require('./api/holidays');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function fetchPage() {
   const url = 'https://www.etoro.com/markets/btc';
   const result = await fetch(url);
   const response = await result.text();
   console.log(response);
}

async function testJobs() {
   await sleep(15000);
   const { name, symbol, currency, url, selector, separatorChar, tradingPlatform } = assets[0];
   const assetKey = getAssetKey(name, symbol, currency);
   const job1 = addJob(
      assetKey,
      'test_job',
      'long period',
      () => {
         console.log('Long term test');
      },
      moment.utc(),
   );
   const job2 = addJob(
      assetKey,
      'test_job_short',
      'short period',
      () => {
         console.log('Short term test');
      },
      moment.utc(),
   );
   await sleep(15000);
   console.log('!!!!!!!!! removed all jobs !!!!!!!!!');
   removeAssetJob(job1);
   removeAssetJob(job2);
}

async function testHolidays() {
   // convert from local to tz
   // => moment[()].tz(timezone)

   // define date as in the tz defined
   // => moment.tz(...moment constructor, timezone)

   const nowAtAnyPlaceTest = moment.utc().tz(TZ_BERLIN);
   const nowLocalTest = moment().tz(TZ_BERLIN);
   console.log('nowAtAnyPlaceTest :>> ', nowAtAnyPlaceTest.format());
   console.log('nowLocalTest :>> ', nowLocalTest.format());
   const officeHourTest = moment.tz(`01.02.2022 15:11`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
   console.log('officeHourTest :>> ', officeHourTest.format());
   console.log('res :>> ', await getHolidays());
   console.log('isHoliday :>> ', await isHoliday(moment('2022-05-01 15:11').tz(TZ_BERLIN)));
}

module.exports = {
   fetchPage,
   testJobs,
   testHolidays,
};
