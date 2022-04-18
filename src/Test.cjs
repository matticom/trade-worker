const { assets } = require('./Assets');
const { getAssetKey } = require('./db/ModelService');
const { addJob, removeAllAssetJobs } = require('./jobs/jobs');
const { sleep } = require('./tools/General');
const moment = require('moment');

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
   addJob(
      assetKey,
      'test_job',
      'long period',
      () => {
         console.log('Long term test');
      },
      moment.utc(),
   );
   addJob(
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
   removeAllAssetJobs(assetKey);
}

module.exports = {
   fetchPage,
   testJobs,
};
