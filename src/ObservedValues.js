import { DE_FORMAT, EUR, USD, US_FORMAT } from './constants';
import { BITCOIN_LIVE, LANG_SCHWARZ, TRADEGATE } from './TradePlatforms';

export const observedValues = [
   {
      name: 'bitcoin',
      currency: EUR,
      collection: `bitcoin_${EUR}`,
      url: 'https://bitcoin-live.de/author/cryptoticker-io/',
      selector: '#TPIT_name',
      separatorChar: DE_FORMAT,
      platform: BITCOIN_LIVE,
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
   {
      name: 'deka_growth_20',
      currency: EUR,
      collection: `deka_growth_20${EUR}`,
      url: 'https://www.tradegate.de/orderbuch.php?isin=DE000ETFL037',
      selector: '#last',
      separatorChar: DE_FORMAT,
      platform: TRADEGATE,
   },
];
