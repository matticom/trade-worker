import { TradingPlatformCollection } from '../db/schemas';
import moment from 'moment-timezone';
import { TZ_BERLIN } from '../constants';
import { isHoliday } from '../api/holidays';

export async function shouldAskForPrice(platformName) {
   // console.log('platform :>> ', platformName);
   const platform = await TradingPlatformCollection.findOne({ name: platformName });
   if (platform === null) {
      throw `Platform ${platformName} is unknown!`;
   }

   const { tradeWeekend, tradeAnyTime } = platform;
   if (tradeAnyTime) return true;

   const now = moment().tz(TZ_BERLIN);

   if (await isHoliday(now)) return false;

   const dayOfWeek = now.isoWeekday();
   const dateString = now.format('DD.MM.YYYY');

   // what about holidays???
   if (dayOfWeek > 5) {
      // Sat-Sun
      if (!tradeWeekend) {
         return false;
      } else {
         const { tradeStartSat, tradeEndSat, tradeStartSun, tradeEndSun } = platform;
         if (dayOfWeek === 6) {
            // Sat
            const momentTradeStartSat = moment.tz(`${dateString} ${tradeStartSat}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
            const momentTradeEndSat = moment.tz(`${dateString} ${tradeEndSat}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
            return now.isSameOrAfter(momentTradeStartSat) && now.isSameOrBefore(momentTradeEndSat);
         } else {
            // Sun
            const momentTradeStartSun = moment.tz(`${dateString} ${tradeStartSun}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
            const momentTradeEndSun = moment.tz(`${dateString} ${tradeEndSun}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
            return now.isSameOrAfter(momentTradeStartSun) && now.isSameOrBefore(momentTradeEndSun);
         }
      }
   } else {
      // Mon-Fri
      const { tradeStartMonFri, tradeEndMonFri } = platform;
      const momentTradeStart = moment.tz(`${dateString} ${tradeStartMonFri}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
      const momentTradeEnd = moment.tz(`${dateString} ${tradeEndMonFri}`, 'DD.MM.YYYY HH:mm', TZ_BERLIN);
      return now.isSameOrAfter(momentTradeStart) && now.isSameOrBefore(momentTradeEnd);
   }
}
