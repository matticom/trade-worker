import Axios from 'axios';
import moment from 'moment-timezone';
import { TZ_BERLIN } from '../constants';

let currentYear = 2021;
let holiday = [];

export async function getHolidays() {
   if (moment().year() !== currentYear) {
      const options = {
         method: 'GET',
         url: `https://date.nager.at/api/v3/publicholidays/${moment().tz(TZ_BERLIN).year()}/DE`,
      };
      const { data } = await Axios.request(options);
      holiday = data
         .filter((holiday) => holiday.counties === null)
         .map((holiday) => moment.tz(holiday.date, 'YYYY-MM-DD', TZ_BERLIN));
   }
   return holiday;
}

export async function isHoliday(moment) {
   const holidays = await getHolidays();
   return holidays.some((holiday) => holiday.isSame(moment.startOf('day')));
}
