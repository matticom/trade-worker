import moment from 'moment';
import Mongoose from 'mongoose';
import {
   EUR,
   MAX_PEAK_DETERMINATION,
   PEAK_HIGH,
   PEAK_LOW,
   PEAK_PERCENT,
   PLATEAU_MIN_LENGTH,
   PLATEAU_TOLERANCE_PERCENT,
   TIME_AGG_LEVEL,
} from '../constants';
import { getChartDataPointCollection, getChartDataPointName } from '../db/ModelService';
import { getChartDataPoints, getLatestQuote } from '../db/queries';
import { PoiSchema, Poi_CollectionName } from '../db/schemas';
import { peakPlateauDetection } from '../rules/hints';
import { processHistoricalData } from '../services/HistoricalDataService';

export async function getLongTermPois(assetChartName, startMoment) {
   const DayCollection = getChartDataPointCollection(assetChartName, TIME_AGG_LEVEL.DAY);

   const historicalDayQuotes = await getChartDataPoints(DayCollection, startMoment);
   const latestDocArray = await getLatestQuote(assetChartName);

   let data = [...historicalDayQuotes, ...latestDocArray];
   console.log('data.length :>> ', data.length);
   const params = {
      maxPeakDetermination: MAX_PEAK_DETERMINATION,
      peakPercent: PEAK_PERCENT,
      plateauMinLength: PLATEAU_MIN_LENGTH,
      plateauTolerancePercent: PLATEAU_TOLERANCE_PERCENT,
   };
   data = data.map(({ value, date }) => ({ value, date: moment(date).unix() }));
   return peakPlateauDetection(data, params);
}

export async function controlLongTermPois(assetChartName) {
   try {
      await processHistoricalData('Gold', 'GOLD', EUR); // fetch historical GOLD data in db
   } catch (error) {
      console.log('Sth went wrong :>> ', error);
   }

   console.log('^1 :>> ');
   const PoiCollection = Mongoose.model(Poi_CollectionName, PoiSchema, Poi_CollectionName);
   const chartName = getChartDataPointName(assetChartName, TIME_AGG_LEVEL.DAY);

   const latestPeakArray = await PoiCollection.find({ chartName, $or: [{ type: PEAK_LOW }, { type: PEAK_HIGH }] })
      .sort({ date: -1 })
      .limit(1);
   const latestNotifiedPeak = latestPeakArray.length > 0 ? latestPeakArray[0] : { date: 0 };
   console.log('^2 :>> ');

   // const lastestFoundPeakArray = (await getLongTermPois(assetChartName)).filter(
   //    (poi) => poi.type === PEAK_HIGH || poi.type === PEAK_LOW,
   // );
   const lastestFoundPeakArray = await getLongTermPois(assetChartName);
   console.log('lastestFoundPeakArray :>> ', lastestFoundPeakArray);
   const latestFoundPeak =
      lastestFoundPeakArray.length > 0 ? lastestFoundPeakArray[lastestFoundPeakArray.length - 1] : { date: 0 };

   console.log('latestNotifiedPeak :>> ', latestNotifiedPeak);
   console.log('latestFoundPeak :>> ', latestFoundPeak);
   if (latestNotifiedPeak.date === 0 && latestFoundPeak.date === 0) return;

   if (latestNotifiedPeak.date < latestFoundPeak.date) {
      const { value, date, type, dateStr } = latestFoundPeak;
      console.log('date :>> ', date);
      const newPeak = new PoiCollection({ value, date: moment.unix(date).toDate(), type, chartName });
      await newPeak.save();
      console.log(
         'send Email :>> ',
         `New peak found for ${chartName} (type: ${type}, date: ${dateStr}, price: ${value})`,
      );
   }
}
