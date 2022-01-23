import moment from 'moment';
import { EUR, TIME_AGG_LEVEL } from '../constants';
import { getAssetChartName, getChartDataPointCollection, getChartDataPointName } from '../db/ModelService';
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
      if (moment.unix(quotes[quotes.length - 1].date).hours() !== moment.unix(quotes[quotes.length - 2].date).hours()) {
         quotes.pop();
      }
   }
   // console.log('quotes[l] :>> ', moment.unix(quotes[quotes.length - 1].date).format());
   // console.log('quotes[l-1] :>> ', moment.unix(quotes[quotes.length - 2].date).format());
   // console.log('quotes[l-2] :>> ', moment.unix(quotes[quotes.length - 3].date).format());

   let newDocuments = quotes.map((quote) => ({
      value: quote.price,
      date: moment.unix(quote.date).startOf('day').toDate(),
   }));

   const assetChartName = getAssetChartName(assetName, assetSymbol, currency);
   const DayCollection = getChartDataPointCollection(assetChartName, TIME_AGG_LEVEL.DAY);

   const latestDocArray = await DayCollection.find().sort({ date: -1 }).limit(1);
   if (latestDocArray.length !== 0) {
      const latestDoc = latestDocArray[0];
      newDocuments = newDocuments.filter((doc) => moment(doc.date).isAfter(moment(latestDoc.date)));
   }

   if (newDocuments.length > 0) {
      await db.collection(getChartDataPointName(assetChartName, TIME_AGG_LEVEL.DAY)).insertMany(newDocuments);
   }
}
