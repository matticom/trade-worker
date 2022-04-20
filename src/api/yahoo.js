import axios from 'axios';
import moment from 'moment-timezone';
import { TZ_BERLIN } from '../constants';

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

// use stock/v3/get-chart
export async function getHistoricalData(symbol = 'EL4C.DE', region = 'DE', range = '5y') {
   const options = {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart',
      params: {
         interval: '1d',
         symbol,
         range,
         region,
         includePrePost: 'false',
         useYfid: 'true',
         includeAdjustedClose: 'false',
      },
      headers: {
         'x-rapidapi-host': credentials.matticom.host,
         'x-rapidapi-key': credentials.matticom.key,
      },
   };

   const res = await axios.request(options);

   if (res.error) throw new Error(res.error);
   const data = res.data;
   const result = data.chart.result;
   if (result.length === 0) return [];

   const quotes = [];
   for (let index = 0; index < result[0].timestamp.length; index++) {
      const date = result[0].timestamp[index];
      const price = result[0].indicators.quote[0].close[index];
      quotes.push({ date, price });
   }
   return quotes;
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
   return result;
}

// just for finding right symbol
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
         date: moment.unix(regularMarketTime).tz(TZ_BERLIN).format(),
         price: regularMarketPrice,
         fullName: fullExchangeName,
      }),
   );
}
