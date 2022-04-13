const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function fetchPage() {
   const url = 'https://www.etoro.com/markets/btc';
   const result = await fetch(url);
   const response = await result.text();
   console.log(response);
}

module.exports = {
   fetchPage,
};
