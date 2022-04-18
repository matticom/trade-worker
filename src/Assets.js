import { DE_FORMAT, EN_FORMAT, EUR, USD, TIME_AGG_LEVEL } from './constants';
import { CRYPTOWAT_CH, LANG_SCHWARZ, TRADEGATE } from './TradePlatforms';

export const assets = [
   // {
   //    name: 'Bitcoin',
   //    symbol: 'BTC',
   //    currency: USD,
   //    url: 'https://cryptowat.ch/de/markets?exchanges=coinbase-pro&types=spot%2Bfutures',
   //    selector:
   //       '#main-content > div > div > div.flex-auto.relative > div > div._2vIYFryyej_f3bjB-WdZ5k > div._1tMBpOIxmFTWKpDZeiRBRV > div > a:nth-child(2) > span:nth-child(4)',
   //    separatorChar: DE_FORMAT,
   //    tradingPlatform: CRYPTOWAT_CH,
   //    params: {
   //       [TIME_AGG_LEVEL.DAY]: {
   //          plateauMinLength: 10,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 15,
   //       },
   //       [TIME_AGG_LEVEL.HOUR]: {
   //          plateauMinLength: 10,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 15,
   //       },
   //       [TIME_AGG_LEVEL.MINUTE]: {
   //          plateauMinLength: 10,
   //          plateauTolerancePercent: 4,
   //          peakPercent: 10,
   //          peakDetectionTimeout: 15,
   //       },
   //    },
   // },
   {
      name: 'Gold',
      symbol: 'GOLD',
      isin: 'CA0679011084',
      currency: EUR,
      url: 'https://www.ls-tc.de/de/etf/52412',
      selector:
         '#chart5push > span.mid.quote.visible-sm-block.visible-xs-inline.visible-md-inline.visible-lg-inline > span',
      separatorChar: DE_FORMAT,
      tradingPlatform: LANG_SCHWARZ,
      params: {
         [TIME_AGG_LEVEL.DAY]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 1,
            peakPercent: 10,
            peakDetectionTimeout: 60,
         },
         [TIME_AGG_LEVEL.HOUR]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 1,
            peakPercent: 10,
            peakDetectionTimeout: 60,
         },
         [TIME_AGG_LEVEL.MINUTE]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 1,
            peakPercent: 10,
            peakDetectionTimeout: 60,
         },
      },
   },
   {
      name: 'Deka STOXX® Europe Strong Growth 20 UCITS ETF',
      symbol: 'EL4C.DE',
      isin: 'DE000ETFL037',
      currency: EUR,
      url: 'https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037',
      selector: '#last',
      separatorChar: DE_FORMAT,
      tradingPlatform: TRADEGATE,
      params: {
         [TIME_AGG_LEVEL.DAY]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 40,
         },
         [TIME_AGG_LEVEL.HOUR]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 40,
         },
         [TIME_AGG_LEVEL.MINUTE]: {
            plateauMinLength: 15,
            plateauTolerancePercent: 4,
            peakPercent: 10,
            peakDetectionTimeout: 40,
         },
      },
   },
];
