import { PEAK_PERCENT, PLATEAU_MIN_LENGTH, PLATEAU_TOLERANCE_PERCENT, TIME_AGG_LEVEL } from '../constants';
import { getChartDataPointCollection } from '../db/ModelService';
import { getChartDataPoints, getLatestQuote } from '../db/queries';
import { peakPlateauDetection } from '../rules/hints';

export async function getLongTermPois(assetChartName, startMoment) {
   const DayCollection = getChartDataPointCollection(assetChartName, TIME_AGG_LEVEL.DAY);

   const historicalDayQuotes = await getChartDataPoints(DayCollection, startMoment);
   const latestDocArray = await getLatestQuote(assetChartName);

   const data = [...historicalDayQuotes, ...latestDocArray];
   const params = {
      peakPercent: PEAK_PERCENT,
      plateauMinLength: PLATEAU_MIN_LENGTH,
      plateauTolerancePercent: PLATEAU_TOLERANCE_PERCENT,
   };
   return peakPlateauDetection(data, params);
}

// export async function controlLongTermPois(){
//     const lastPeak =
// }
