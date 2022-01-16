import { DE_FORMAT, EUR, USD, US_FORMAT } from './constants';
import { CRYPTOWAT_CH, LANG_SCHWARZ, TRADEGATE } from './TradePlatforms';

export const observedValues = [
   {
      name: 'bitcoin',
      currency: USD,
      collection: `bitcoin_${USD}`,
      url: 'https://cryptowat.ch/de/markets?exchanges=coinbase-pro&types=spot%2Bfutures',
      selector:
         '#main-content > div._1CZlleZyTkBWdwiqPAtD42._3xU5PubFxb555mRDevexEE._1bOs1PZ_k9qn93M5PNb86N.w-full.max-w-full.pl-10.pr-10.mb-4 > a:nth-child(2) > div.text-left._1hazOxgsUXq0rb-UgDZwNp.rankings-list-price.pr-5._1yJmkULWEMOpD402X_MVLe',
      separatorChar: DE_FORMAT,
      platform: CRYPTOWAT_CH,
   },
   {
      name: 'gold',
      currency: EUR,
      collection: `gold_${EUR}`,
      url: 'https://www.ls-tc.de/de/etf/52412',
      selector:
         '#chart5push > span.mid.quote.visible-sm-block.visible-xs-inline.visible-md-inline.visible-lg-inline > span',
      separatorChar: DE_FORMAT,
      platform: LANG_SCHWARZ,
   },
   // {
   //    name: 'deka_growth_20',
   //    currency: EUR,
   //    collection: `deka_growth_20${EUR}`,
   //    url: 'https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037',
   //    selector: '#last',
   //    separatorChar: DE_FORMAT,
   //    platform: TRADEGATE,
   // },
];
