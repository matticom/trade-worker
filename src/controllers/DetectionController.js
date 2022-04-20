import moment from 'moment-timezone';
import { TZ_BERLIN } from '../constants';

import { EUR, PEAK_HIGH, PEAK_LOW, TIME_AGG_LEVEL } from '../constants';
import { getAssetTimeAggChart, getChartDataPointCollection, getChartDataPointName } from '../db/ModelService';
import { getChartDataPoints, getLatestQuote } from '../db/queries';
import { PoiCollection } from '../db/schemas';
import { peakPlateauDetection } from '../rules/hints';
import { processHistoricalData } from '../services/HistoricalDataService';

export async function getLongTermPois(assetKey, startMoment) {
   const assetTimeAggChart = await getAssetTimeAggChart(assetKey, TIME_AGG_LEVEL.DAY);
   const { peakDetectionTimeout, peakPercent, plateauTolerancePercent, plateauMinLength } = assetTimeAggChart;
   const params = { peakDetectionTimeout, peakPercent, plateauTolerancePercent, plateauMinLength };
   const DayCollection = getChartDataPointCollection(assetKey, TIME_AGG_LEVEL.DAY);

   const historicalDayQuotes = await getChartDataPoints(DayCollection, startMoment);
   const latestDocArray = await getLatestQuote(assetKey);

   let data = [...historicalDayQuotes, ...latestDocArray];
   console.log('data.length :>> ', data.length);
   data = data.map(({ value, date }) => ({ value, date: moment(date).unix() }));
   return peakPlateauDetection(data, params);
}

export async function controlLongTermPois(assetKey) {
   try {
      await processHistoricalData('Gold', 'GOLD', EUR); // fetch historical GOLD data in db
   } catch (error) {
      console.log('Sth went wrong :>> ', error);
   }

   const chartName = getChartDataPointName(assetKey, TIME_AGG_LEVEL.DAY);
   console.log('^1 chartName:>> ', chartName);

   const latestPeakArray = await PoiCollection.findOne({
      chartName,
      $or: [{ type: PEAK_LOW }, { type: PEAK_HIGH }],
   }).sort({ date: -1 });
   // const latestNotifiedPeak = latestPeakArray.length > 0 ? latestPeakArray[0] : { date: 0 };
   const latestNotifiedPeak = latestPeakArray !== null ? latestPeakArray : { date: 0 };

   // const lastestFoundPeakArray = (await getLongTermPois(assetKey)).filter(
   //    (poi) => poi.type === PEAK_HIGH || poi.type === PEAK_LOW,
   // );
   const lastestFoundPeakArray = await getLongTermPois(assetKey);
   // console.log('lastestFoundPeakArray :>> ', lastestFoundPeakArray);
   const latestFoundPeak =
      lastestFoundPeakArray.length > 0 ? lastestFoundPeakArray[lastestFoundPeakArray.length - 1] : { date: 0 };

   // console.log('latestNotifiedPeak :>> ', latestNotifiedPeak);
   // console.log('latestFoundPeak :>> ', latestFoundPeak);
   if (latestNotifiedPeak.date === 0 && latestFoundPeak.date === 0) return;

   if (latestNotifiedPeak.date < latestFoundPeak.date) {
      const { value, date, type, dateStr, criteria, detectionDate } = latestFoundPeak;
      console.log('date :>> ', date);
      const newPeak = new PoiCollection({
         value,
         date: moment.unix(date).tz(TZ_BERLIN).toDate(), // TODO: right date?
         type,
         chartName,
         criteria,
         detectionDate,
      });
      await newPeak.save();
      console.log(
         'send Email :>> ',
         `New peak found for ${chartName} (type: ${type}, date: ${dateStr}, price: ${value})`,
      );
   }
}
