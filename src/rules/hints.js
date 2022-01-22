import moment from 'moment';
import {
   PEAK_PERCENT,
   PLATEAU_MIN_LENGTH,
   PLATEAU_TOLERANCE_PERCENT,
   RECENTLY_DROPPED_PERCENT,
   RECENTLY_TIME_SPAN_DAYS,
} from '../constants';

export function recentlyDropped(data, currentIdx) {
   // console.log('data.length :>> ', data.length);
   const currentValue = data[currentIdx].value;
   const countOfLookBackIntervals = data.length < RECENTLY_TIME_SPAN_DAYS ? data.length - 1 : RECENTLY_TIME_SPAN_DAYS;
   const consideredData = data.slice(currentIdx - countOfLookBackIntervals, currentIdx);
   const maxValue = Math.max(...consideredData.map((d) => d.value));
   if (countOfLookBackIntervals > 0 && currentValue > data[currentIdx - 1].value) {
      return;
   }
   // console.log('consideredData :>> ', consideredData);
   // console.log('maxValue :>> ', maxValue);
   const dropValue = 100 - (100 * currentValue) / maxValue;
   console.log('dropValue :>> ', dropValue);
   console.log('current date :>> ', moment.unix(data[currentIdx].date).format('D. MMM YYYY'));
   const dpThresholdReached = dropValue > RECENTLY_DROPPED_PERCENT;
   if (dpThresholdReached) {
      console.log(
         `!!!! Drop of more than ${RECENTLY_DROPPED_PERCENT}:>> `,
         moment.unix(data[currentIdx].date).format('D. MMM YYYY'),
      );
   }
}

export function staticPercentThresholds(data, thresholdArray) {
   const reference = data[0].value;
   const lastElementIdx = data.length - 1;

   let result = { last: null };
   const history = [
      {
         threshold: 0,
         type: 'ref',
         dateStr: moment.unix(data[0].date).format('YYYY-MM-DD'),
         date: data[0].date,
         value: reference,
      },
   ];

   let reachedPositiveThresholds = 0;
   let reachedNegativeThresholds = 0;

   data.forEach(({ value, date }, idx) => {
      // console.log('\nn current idx :>> ', idx);
      // console.log('lastElementIdx :>> ', lastElementIdx);
      // console.log('reachedNegativeThresholds :>> ', reachedNegativeThresholds);
      const thresholds = thresholdArray.sort((a, b) => b - a);
      for (let index = 0; index < thresholds.length; index++) {
         const threshold = thresholds[index];
         // console.log('threshold :>> ', threshold);
         // console.log('value :>> ', value);
         if (reference + percent(threshold, reference) <= value) {
            if (threshold > reachedPositiveThresholds) {
               const entry = {
                  threshold,
                  type: 'positive',
                  dateStr: moment.unix(date).format('YYYY-MM-DD'),
                  date,
                  value,
               };
               if (idx === lastElementIdx) {
                  result = { last: entry };
               } else {
                  history.push(entry);
                  reachedPositiveThresholds = threshold;
               }
            }
         }
         // console.log('low limit :>> ', reference - percent(threshold, reference));
         if (reference - percent(threshold, reference) >= value) {
            // console.log('less than :>> ');
            if (threshold > reachedNegativeThresholds) {
               // console.log('less than last threshold :>> ');
               const entry = {
                  threshold,
                  type: 'negative',
                  dateStr: moment.unix(date).format('YYYY-MM-DD'),
                  date,
                  value,
               };
               if (idx === lastElementIdx) {
                  result = { last: entry };
               } else {
                  history.push(entry);
                  reachedNegativeThresholds = threshold;
               }
            }
         }
      }
   });

   return { ...result, history };
}

export function peakPlateauDetection(
   dayData,
   params = {
      peakPercent: PEAK_PERCENT,
      plateauMinLength: PLATEAU_MIN_LENGTH,
      plateauTolerancePercent: PLATEAU_TOLERANCE_PERCENT,
   },
) {
   let negativeSlope = false;
   let positiveSlope = false;
   let start = true;
   let currentPlateauLength = 1;
   let currentUpperPlateauThreshold = 0;
   let currentBottomPlateauThreshold = 0;

   let currentPeak = dayData[0];
   const foundPeakPlateau = [];

   dayData.forEach((quote, idx, dataArray) => {
      const { value } = quote;
      if (start) {
         if (value > upperThreshold(currentPeak.value, params.peakPercent)) {
            positiveSlope = true;
            currentPeak = quote;
            start = false;
         }
         if (value < bottomThreshold(currentPeak.value, params.peakPercent)) {
            negativeSlope = true;
            currentPeak = quote;
            start = false;
         }
      } else {
         if (currentPlateauLength === 1) {
            const upperPlateauThreshold = upperThreshold(dataArray[idx - 1].value, params.plateauTolerancePercent);
            const bottomPlateauThreshold = bottomThreshold(dataArray[idx - 1].value, params.plateauTolerancePercent);
            if (bottomPlateauThreshold <= value && value <= upperPlateauThreshold) {
               currentUpperPlateauThreshold = upperPlateauThreshold;
               currentBottomPlateauThreshold = bottomPlateauThreshold;
               currentPlateauLength = 2;
            }
         } else {
            // currentPlateauLength > 1
            const upperPlateauThreshold = currentUpperPlateauThreshold;
            const bottomPlateauThreshold = currentBottomPlateauThreshold;
            if (bottomPlateauThreshold <= value && value <= upperPlateauThreshold) {
               currentPlateauLength += 1;
            } else {
               if (currentPlateauLength >= params.plateauMinLength) {
                  foundPeakPlateau.push({ ...dataArray[idx - currentPlateauLength], type: 'plateau_start' });
                  foundPeakPlateau.push({ ...dataArray[idx - 1], type: 'plateau_end' });
               }
               currentPlateauLength = 1;
            }
         }

         if (positiveSlope) {
            if (value < bottomThreshold(currentPeak.value)) {
               negativeSlope = true;
               positiveSlope = false;
               foundPeakPlateau.push({ ...currentPeak, type: 'high' });
               currentPeak = quote; // new low peak
            }
            if (currentPeak.value < quote.value) {
               currentPeak = quote;
            }
         }
         if (negativeSlope) {
            if (value > upperThreshold(currentPeak.value)) {
               negativeSlope = false;
               positiveSlope = true;
               foundPeakPlateau.push({ ...currentPeak, type: 'low' });
               currentPeak = quote; // new high peak
            }
            if (currentPeak.value > quote.value) {
               currentPeak = quote;
            }
         }
      }
   });
   return foundPeakPlateau.map(({ value, date, type }) => ({
      value,
      date,
      dateStr: moment.unix(date).format('YYYY-MM-DD'),
      type,
   }));
}

function upperThreshold(reference, percentage) {
   return reference + (reference * percentage) / 100;
}

function bottomThreshold(reference, percentage) {
   return reference - (reference * percentage) / 100;
}

// what about slight declines -2 +1 -3 +1 -2 --> sliding windows --> acknowledge = reset
