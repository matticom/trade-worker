import { DE_FORMAT, EN_FORMAT, EUR, USD, TIME_AGG_LEVEL } from './constants';
import { CRYPTOWAT_CH, LANG_SCHWARZ, TRADEGATE } from './TradePlatforms';

export const assets = [
   {
      name: 'Bitcoin',
      symbol: 'BTC',
      currency: USD,
      url: 'https://www.etoro.com/markets/btc',
      selector: `body > ui-layout > div > et-layout-main > div > div.container-level2.layout-sidenav-expanded.layout-sidenav-closed > div.container-level3 > div.page-content > div > ng-view > et-market > div > div > et-market-header > div > div.user-market-head-content-ph > div.user-market-head-content > div.head-info-stats > div`,
      separatorChar: DE_FORMAT,
      tradingPlatform: CRYPTOWAT_CH,
      params: {
         [TIME_AGG_LEVEL.DAY]: {
            plateauMinLength: 10,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 15,
         },
         [TIME_AGG_LEVEL.HOUR]: {
            plateauMinLength: 10,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 15,
         },
         [TIME_AGG_LEVEL.MINUTE]: {
            plateauMinLength: 10,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 15,
         },
      },
   },
   // {
   //    name: 'Gold',
   //    symbol: 'GOLD',
   //    isin: 'CA0679011084',
   //    currency: EUR,
   //    url: 'https://www.ls-tc.de/de/etf/52412',
   //    selector:
   //       '#chart5push > span.mid.quote.visible-sm-block.visible-xs-inline.visible-md-inline.visible-lg-inline > span',
   //    separatorChar: DE_FORMAT,
   //    tradingPlatform: LANG_SCHWARZ,
   //    params: {
   //       [TIME_AGG_LEVEL.DAY]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 1,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 60,
   //       },
   //       [TIME_AGG_LEVEL.HOUR]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 1,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 60,
   //       },
   //       [TIME_AGG_LEVEL.MINUTE]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 1,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 60,
   //       },
   //    },
   // },
   // {
   //    name: 'Deka STOXX® Europe Strong Growth 20 UCITS ETF',
   //    symbol: 'EL4C.DE',
   //    isin: 'DE000ETFL037',
   //    currency: EUR,
   //    url: 'https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037',
   //    selector: '#last',
   //    separatorChar: DE_FORMAT,
   //    tradingPlatform: TRADEGATE,
   //    params: {
   //       [TIME_AGG_LEVEL.DAY]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 40,
   //       },
   //       [TIME_AGG_LEVEL.HOUR]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 40,
   //       },
   //       [TIME_AGG_LEVEL.MINUTE]: {
   //          plateauMinLength: 15,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 40,
   //       },
   //    },
   // },
];
