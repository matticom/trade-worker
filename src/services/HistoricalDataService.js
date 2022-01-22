import moment from 'moment';
import { DAY_COLLECTION_POSTFIX } from '../constants';
import { assetHistoryModels } from '../db/ModelService';
import { db } from '../db/mongoDb';

const { findAsset, getHistoricalData } = require('../api/yahoo');

export async function processHistoricalData(searchTerm = 'gold', collectionName = 'gold_EUR') {
   const result = await findAsset(searchTerm);
   //    console.log('result :>> ', result);
   // choose symbol
   const selectSymbol = result[0].symbol;
   const quotes = await getHistoricalData(selectSymbol);
   if (quotes.length > 1) {
      if (moment.unix(quotes[quotes.length - 1].date).hours() !== moment.unix(quotes[quotes.length - 2].date).hours()) {
         quotes.pop();
      }
   }
   // console.log('quotes[l] :>> ', moment.unix(quotes[quotes.length - 1].date).format());
   // console.log('quotes[l-1] :>> ', moment.unix(quotes[quotes.length - 2].date).format());
   // console.log('quotes[l-2] :>> ', moment.unix(quotes[quotes.length - 3].date).format());

   let newDocuments = quotes.map((quote) => ({
      value: quote.close,
      date: moment.unix(quote.date).startOf('day').toDate(),
   }));

   const goldDayModel = assetHistoryModels.get(collectionName).DayModel;

   const latestDocArray = await goldDayModel.find().sort({ date: -1 }).limit(1);
   if (latestDocArray.length !== 0) {
      const latestDoc = latestDocArray[0];
      newDocuments = newDocuments.filter((doc) => moment(doc.date).isAfter(moment(latestDoc.date)));
   }

   if (newDocuments.length > 0) {
      await db.collection(`${collectionName}${DAY_COLLECTION_POSTFIX}`).insertMany(newDocuments);
   }
}
