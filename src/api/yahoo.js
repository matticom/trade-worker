import axios from 'axios';
import moment from 'moment-timezone';
import Mongoose from 'mongoose';
import { ChartHistorySchema } from '../db/schemas';

const credentials = {
   matticom: {
      key: process.env.MATTICOM_KEY,
      host: process.env.MATTICOM_HOST,
   },
   mattify: {
      key: process.env.MATTIFY_KEY,
      host: process.env.MATTIFY_HOST,
   },
};

export async function getHistoricalData(symbol = 'EL4C.DE', region = 'DE') {
   const options = {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data',
      params: { symbol, region },
      headers: {
         'x-rapidapi-host': credentials.matticom.host,
         'x-rapidapi-key': credentials.matticom.key,
      },
   };

   // const res = await axios.request(options);

   // if (res.error) throw new Error(res.error);
   // const data = res.data;
   // const quotes = data.prices;
   // quotes.reverse();
   // const modelData = quotes.map((quote) => ({
   //    price: quote.close,
   //    date: moment.unix(quote.date).utc().startOf('day').toDate(),
   // }));
   // const deka_growth_20 = Mongoose.model('blub', ChartHistorySchema);
}

export async function findAsset(searchTerm = 'EL4C.DE', region = 'DE') {
   const options = {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete',
      params: { q: searchTerm, region },
      headers: {
         'x-rapidapi-host': credentials.matticom.host,
         'x-rapidapi-key': credentials.matticom.key,
      },
   };

   const res = await axios.request(options);
   const quoteObjs = res.data.quotes;
   const quoteSymbols = quoteObjs.map((quote) => quote.symbol);
   const prices = await getLastPrice(quoteSymbols);
   const result = quoteObjs.map((quote, idx) => {
      return {
         ...quote,
         ...prices[idx],
      };
   });
   console.log('result :>> ', result);
   return result;
}

export async function getLastPrice(symbols, region = 'DE') {
   const options = {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes',
      params: { symbols: symbols.join(), region },
      headers: {
         'x-rapidapi-host': credentials.matticom.host,
         'x-rapidapi-key': credentials.matticom.key,
      },
   };

   const res = await axios.request(options);
   return res.data.quoteResponse.result.map(
      ({ symbol, currency, regularMarketTime, regularMarketPrice, fullExchangeName }) => ({
         symbol,
         currency,
         date: moment.unix(regularMarketTime).tz('Europe/Berlin').format(),
         price: regularMarketPrice,
         fullName: fullExchangeName,
      }),
   );
}
