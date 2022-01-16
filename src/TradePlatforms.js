export const CRYPTOWAT_CH = 'CRYPTOWAT_CH';
export const LANG_SCHWARZ = 'LANG_SCHWARZ';
export const TRADEGATE = 'TRADEGATE';

export const tradingPlatforms = {
   [CRYPTOWAT_CH]: {
      tradeWeekend: true,
      tradeAnyTime: true,
   },
   [LANG_SCHWARZ]: {
      tradeStartMonFri: '07:30',
      tradeEndMonFri: '23:00',
      tradeStartSat: '10:00',
      tradeEndSat: '13:00',
      tradeStartSun: '17:00',
      tradeEndSun: '19:00',
      tradeWeekend: true,
      tradeAnyTime: false,
   },
   [TRADEGATE]: {
      tradeStartMonFri: '08:00',
      tradeEndMonFri: '22:00',
      tradeWeekend: false,
      tradeAnyTime: false,
   },
};
