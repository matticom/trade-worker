const unirest = require('unirest');
const fs = require('fs');

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

const req = unirest('GET', 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data');

req.query({
   // period1: '1263513600',
   // period2: '1610919989',
   symbol: 'EL4C.DE',
   // frequency: '1d',
   region: 'DE',
   // filter: 'history',
});
req.headers({
   'x-rapidapi-key': credentials.matticom.key,
   'x-rapidapi-host': credentials.matticom.host,
   useQueryString: true,
});

req.end(function (res) {
   if (res.error) throw new Error(res.error);
   // console.log("res :>> ", JSON.stringify());

   // convert JSON object to string
   const data = res.body;
   const prices = data.prices;
   prices.reverse();

   const pricesStr = JSON.stringify(prices);

   // write JSON string to a file
   fs.writeFile('history.json', pricesStr, (err) => {
      if (err) {
         throw err;
      }
      console.log('JSON data is saved.');
   });
});

export function getHistory() {
   let result = null;

   fs.readFile('history.json', 'utf-8', (err, data) => {
      if (err) {
         throw err;
      }

      // parse JSON object
      result = JSON.parse(data.toString());
   });

   return result;
}
