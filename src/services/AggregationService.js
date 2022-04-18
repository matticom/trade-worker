import _ from 'lodash';
import roundTo from 'round-to';
import cron from 'cron';
import { db } from '../db/mongoDb';
import moment from 'moment';
import { HOUR_RETENTION_IN_DAYS, MINUTE_RETENTION_IN_DAYS, TIME_AGG_LEVEL } from '../constants';
import { getAssetKey, getChartDataPointCollection, getChartDataPointName } from '../db/ModelService';
import { assets } from '../Assets';

async function aggregateLastHour(assetKey) {
   const MinuteCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.MINUTE);
   const HourCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.HOUR);

   const startLastHour = moment().subtract(1, 'hour').startOf('hour');
   const startCurrentHour = moment().startOf('hour');

   const quotes = await MinuteCollection.find({
      date: {
         $gte: startLastHour.toDate(), // date is local time
         $lt: startCurrentHour.toDate(), // -> autom. converted to UTC for DB query (where date is utc)
      },
   });

   if (quotes.length > 0) {
      const avgValue = _.meanBy(quotes, (q) => q.value);
      const newValue = new HourCollection({ value: roundTo(avgValue, 1), date: startLastHour.toDate() });
      await newValue.save();
   }
}

async function aggregateLastDay(assetKey) {
   const HourCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.HOUR);
   const DayCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.DAY);

   const startLastDay = moment().subtract(1, 'day').startOf('day');
   const startCurrentDay = moment().startOf('day');

   const quotes = await HourCollection.find({
      date: {
         $gte: startLastDay.toDate(),
         $lt: startCurrentDay.toDate(),
      },
   });

   if (quotes.length > 0) {
      const avgValue = _.meanBy(quotes, (q) => q.value);
      const newValue = new DayCollection({ value: roundTo(avgValue, 1), date: startLastDay.toDate() });
      await newValue.save();
   }
}

async function deleteOldMinutes(assetKey) {
   const lastRetainDate = moment().startOf('hour').subtract(MINUTE_RETENTION_IN_DAYS, 'days');
   await db
      .collection(getChartDataPointName(assetKey, TIME_AGG_LEVEL.MINUTE))
      .deleteMany({ date: { $lt: lastRetainDate.toDate() } });
}

async function deleteOldHours(assetKey) {
   const lastRetainDate = moment().startOf('day').subtract(HOUR_RETENTION_IN_DAYS, 'days');
   await db
      .collection(getChartDataPointName(assetKey, TIME_AGG_LEVEL.HOUR))
      .deleteMany({ date: { $lt: lastRetainDate.toDate() } });
}

export async function startAggregationService() {
   // starts every new day 30 minutes after midnight
   const dailyJob = new cron.CronJob(`30 00 * * *`, async () => {
      try {
         for (let index = 0; index < assets.length; index++) {
            const { name, symbol, currency } = assets[index];
            const assetKey = getAssetKey(name, symbol, currency);
            await aggregateLastDay(assetKey);
            await deleteOldHours(assetKey);
         }
      } catch (e) {
         console.log('Something went wrong at daily aggregation: ' + e);
      }
   });

   // starts every new hour 5 minutes
   const hourlyJob = new cron.CronJob(`5 * * * *`, async () => {
      try {
         for (let index = 0; index < assets.length; index++) {
            const { name, symbol, currency } = assets[index];
            const assetKey = getAssetKey(name, symbol, currency);
            await aggregateLastHour(assetKey);
            await deleteOldMinutes(assetKey);
         }
      } catch (e) {
         console.log('Something went wrong at hourly aggregation: ' + e);
      }
   });

   dailyJob.start();
   hourlyJob.start();
}
