import moment from 'moment-timezone';
import { EUR, TIME_AGG_LEVEL, TZ_BERLIN } from '../constants';
import { getAssetKey, getChartDataPointCollection, getChartDataPointName } from '../db/ModelService';
import { db } from '../db/mongoDb';

const { findAsset, getHistoricalData } = require('../api/yahoo');

export async function processHistoricalData(assetName = 'Gold', assetSymbol = 'GOLD', currency = EUR) {
   const result = await findAsset(assetName);
   //    console.log('result :>> ', result);
   // choose symbol
   const selectSymbol = result[0].symbol;
   const quotes = await getHistoricalData(selectSymbol);

   // remove strange last value
   if (quotes.length > 1) {
      if (
         moment
            .unix(quotes[quotes.length - 1].date)
            .tz(TZ_BERLIN)
            .hours() !==
         moment
            .unix(quotes[quotes.length - 2].date)
            .tz(TZ_BERLIN)
            .hours()
      ) {
         quotes.pop();
      }
   }
   // console.log('quotes[l] :>> ', moment.unix(quotes[quotes.length - 1].date).tz(TZ_BERLIN).format());
   // console.log('quotes[l-1] :>> ', moment.unix(quotes[quotes.length - 2].date).tz(TZ_BERLIN).format());
   // console.log('quotes[l-2] :>> ', moment.unix(quotes[quotes.length - 3].date).tz(TZ_BERLIN).format());

   let newDocuments = quotes.map((quote) => ({
      value: quote.price,
      date: moment.unix(quote.date).tz(TZ_BERLIN).startOf('day').toDate(),
   }));

   const assetKey = getAssetKey(assetName, assetSymbol, currency);
   const DayCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.DAY);

   const latestDocArray = await DayCollection.find().sort({ date: -1 }).limit(1);
   if (latestDocArray.length !== 0) {
      const latestDoc = latestDocArray[0];
      newDocuments = newDocuments.filter((doc) => moment(doc.date).tz(TZ_BERLIN).isAfter(moment(latestDoc.date)));
   }

   if (newDocuments.length > 0) {
      await db.collection(getChartDataPointName(assetKey, TIME_AGG_LEVEL.DAY)).insertMany(newDocuments);
   }
}
