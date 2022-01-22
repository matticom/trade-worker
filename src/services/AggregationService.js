import _ from 'lodash';
import { roundTo } from 'round-to';
import cron from 'cron';
import { assetHistoryModels } from '../db/ModelService';
import { observedValues } from '../ObservedValues';
import { db } from '../db/mongoDb';
import moment from 'moment';
import { HOUR_COLLECTION_POSTFIX, HOUR_RETENTION_IN_DAYS, MINUTE_RETENTION_IN_DAYS } from '../constants';

async function aggregateLastHour(collection) {
   const { MinuteModel, HourModel } = assetHistoryModels.get(collection);
   const startLastHour = moment().subtract(1, 'hour').startOf('hour');
   const startCurrentHour = moment().startOf('hour');

   const quotes = await MinuteModel.find({
      date: {
         $gte: startLastHour.toDate(), // date is local time
         $lt: startCurrentHour.toDate(), // -> autom. converted to UTC for DB query (where date is utc)
      },
   });

   if (quotes.length > 0) {
      const avgValue = _.meanBy(quotes, (q) => q.value);
      const newValue = new HourModel({ value: roundTo(avgValue, 1), date: startLastHour.toDate() });
      await newValue.save();
   }
}

async function aggregateLastDay(collection) {
   const { HourModel, DayModel } = assetHistoryModels.get(collection);
   const startLastDay = moment().subtract(1, 'day').startOf('day');
   const startCurrentDay = moment().startOf('day');

   const quotes = await HourModel.find({
      date: {
         $gte: startLastDay.toDate(),
         $lt: startCurrentDay.toDate(),
      },
   });

   if (quotes.length > 0) {
      const avgValue = _.meanBy(quotes, (q) => q.value);
      const newValue = new DayModel({ value: roundTo(avgValue, 1), date: startLastDay.toDate() });
      await newValue.save();
   }
}

async function deleteOldMinutes(collection) {
   const lastRetainDate = moment().startOf('hour').subtract(MINUTE_RETENTION_IN_DAYS, 'days');
   await db.collection(collection).deleteMany({ date: { $lt: lastRetainDate.toDate() } });
}

async function deleteOldHours(collection) {
   const lastRetainDate = moment().startOf('day').subtract(HOUR_RETENTION_IN_DAYS, 'days');
   await db
      .collection(`${collection}${HOUR_COLLECTION_POSTFIX}`)
      .deleteMany({ date: { $lt: lastRetainDate.toDate() } });
}

export async function startAggregationService() {
   // starts every new day 30 minutes after midnight
   const dailyJob = new cron.CronJob(`30 00 * * *`, async () => {
      try {
         for (let index = 0; index < observedValues.length; index++) {
            const { collection } = observedValues[index];
            await aggregateLastDay(collection);
            await deleteOldHours(collection);
         }
      } catch (e) {
         console.log('Something went wrong at daily aggregation: ' + e);
      }
   });

   // starts every new hour 5 minutes after midnight
   const hourlyJob = new cron.CronJob(`5 * * * *`, async () => {
      try {
         for (let index = 0; index < observedValues.length; index++) {
            const { collection } = observedValues[index];
            await aggregateLastHour(collection);
            await deleteOldMinutes(collection);
         }
      } catch (e) {
         console.log('Something went wrong at hourly aggregation: ' + e);
      }
   });

   dailyJob.start();
   hourlyJob.start();
}
