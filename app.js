'use strict';

require('dotenv').config();

require('express-async-errors');
const fs = require('fs');

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getResult } from './src/controllers/SimulationController';

import http from 'http';
import CommunicationService from './src/services/CommunicationService';
import TestRouter from './src/routes/TestRouter';
import { db, getCollections } from './src/db/mongoDb';
import { Trade, Profile, Asset, deka_growth_20, ChartHistorySchema } from './src/db/schemas';
import { findAsset, getHistoricalData } from './src/api/yahoo';
import Mongoose from 'mongoose';
import { createAsset, findAssetBySymbol } from './src/db/queries';
import {
   activePages,
   getPageHTML,
   monitoringObservationHealth,
   startBrowser,
   startObservationJob,
   test,
} from './src/services/ScrapeService';
import { observedValues } from './src/ObservedValues';

const port = process.env.PORT || 8200;
const app = express();

const models = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(helmet());

// app.use('/viewers', ViewersRouter);
// app.use('/simulation', getResult);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
   console.log('Connected to MongoDB');
});
// const matti = new Profile({ name: 'Matti' });
// matti.save();
// const bitcoin = new Asset({ name: 'Bitcoin' });
// bitcoin.save();

// const firstTrade = new Trade({
//    action: 'buy',
//    date: Date.now(),
//    balance: 10448.57,
//    asset: '6122c9b75f7d802d8c55ca86',
//    pieces: 36,
//    price: 627.34,
//    profileId: '6122c9b75f7d802d8c55ca85',
// });
// firstTrade.save();

// Date query (model is e.g. "Trade" model)
// ----------
// const logs = await model.find({
//    date: {
//       $gte: moment('2022-01-13T18:05:24.888').toDate(), // date is local time
//       $lt: moment('2022-01-13T18:07:08.174').toDate(), // -> autom. converted to UTC for DB query (where date is utc)
//    },
// });
// console.log('logs :>> ', logs);

// getHistoricalData();
// findAsset('volkswagen');
// getPageHTML();

startObservationJob();

monitoringObservationHealth();

// setInterval(() => {
//    let hasObserveIssues = false;
//    Object.keys(activePages).forEach((pageKey) => {
//       if (!activePages[pageKey].active) {
//          hasObserveIssues = true;
//       }
//    });
//    if (hasObserveIssues) {
//       console.log(
//          'activePages :>> ',
//          Object.keys(activePages).map((url) => ({
//             ...activePages[url],
//             intervalId: activePages[url].intervalId !== null,
//             emitter: activePages[url].emitter !== null,
//          })),
//       );
//    }

//    for (let index = 0; index < models.length; index++) {
//       const { model, name } = models[index];

//    }

//    // console.log('ipIsBeingChanged :>> ', ipIsBeingChanged);

// }, 12000);

// test();

// findAssetBySymbol('BTC').then((res) => console.log('res :>> ', res));

// fs.readFile('history.json', 'utf-8', (err, data) => {
//    if (err) {
//       throw err;
//    }

//    // parse JSON object
//    const result = JSON.parse(data.toString());
//    const historicalData = result.map(({ price, date }) => ({ price, date: Date.parse(date) }));

//    console.log('result :>> ', result);
//    // historicalData.forEach((data) => {
//    //    const newDoc = new deka(data);
//    //    newDoc.save();
//    // });

//    const deka_growth_20 = Mongoose.model('bla', ChartHistorySchema);

//    deka_growth_20
//       .insertMany(historicalData)
//       .then((res) => {
//          console.log('result ', res);
//       })
//       .catch((err) => {
//          console.error('error ', err);
//       });
// });

// getHistoricalData().then((historicalData) => {
//    console.log('historicalData :>> ', historicalData);

// });

app.use('/', TestRouter);

/**
 * Catch-all
 */
app.all('*', function (req, res) {
   return res.status(404).send('The requested URL was not found on this server');
});

/**
 * Error handling
 */
app.use(function (err, req, res, next) {
   console.log('error occurred :', err);

   const errorResponse = err.response
      ? {
           status: err.response.status,
           statusText: err.response.statusText,
           url: err.response.config.url,
           method: err.response.config.method,
           stack: err.stack,
        }
      : err.toString();

   res.status(500).json({
      error: errorResponse,
   });
});

/**
 * Start server
 */
app.listen(port, function (err) {
   if (err !== undefined) {
      console.error(err);
      return;
   }

   console.info('Listening on port ' + port);
});