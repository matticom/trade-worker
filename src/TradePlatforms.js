export const CRYPTOWAT_CH = 'CRYPTOWAT_CH';
export const LANG_SCHWARZ = 'LANG_SCHWARZ';
export const TRADEGATE = 'TRADEGATE';

export const tradingPlatforms = [
   {
      name: CRYPTOWAT_CH,
      tradeWeekend: true,
      tradeAnyTime: true,
   },
   {
      name: LANG_SCHWARZ,
      tradeWeekend: true,
      tradeAnyTime: false,
      hours: {
         tradeStartMonFri: '07:30',
         tradeEndMonFri: '23:00',
         tradeStartSat: '10:00',
         tradeEndSat: '13:00',
         tradeStartSun: '17:00',
         tradeEndSun: '19:00',
      },
   },
   {
      name: TRADEGATE,
      tradeWeekend: false,
      tradeAnyTime: false,
      hours: {
         tradeStartMonFri: '08:00',
         tradeEndMonFri: '22:00',
      },
   },
];
