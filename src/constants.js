export const SIMULATION = 'simulation';
export const BEST_STATIC_PARAM = 'bestStaticParam';
export const GIVEN_STATIC_PARAM = 'givenStaticParam';

export const INITIAL_MONEY = 1000;

export const MIN_TOLERANCE = 1; //3
export const MAX_TOLERANCE = 20; //20
export const MIN_DAYS = 3; //10
export const MAX_DAYS = 100; //100
export const MAX_TRANSACTIONS_PER_YEAR = 12; //12

export const MAX_DROP_PERCENT = 12; //20;
export const LOOK_BACK_FOR_PEAK_WINDOW_IN_DAYS = 100; //100;
export const MAX_TWO_DAY_SPIKE_PERCENT = 10;
export const WAITING_AFTER_SPIKE_DAYS = 10;
export const MAX_DROP_AFTER_BUY = 6;

export const RECENTLY_DROPPED_PERCENT = 10; //20;
export const RECENTLY_TIME_SPAN_DAYS = 3; //20;

// oberservation for potencial invests: V curves --> loss drop, start of increase

export const ASSET_POLLING_INTERVAL_LENGTH_MSEC = 10000; //50 * 1000;
export const ASSET_POLLING_FUZZY_LENGTH_MSEC = 2000; //10 * 1000;

// currencies

export const EUR = 'EUR';
export const USD = 'USD';
export const BTC = 'BTC';

export const EN_FORMAT = ',';
export const DE_FORMAT = '.';

// retentions

export const MINUTE_RETENTION_IN_DAYS = 3;
export const HOUR_RETENTION_IN_DAYS = 30;

// detection
export const PEAK_PERCENT = 10;
export const PLATEAU_MIN_LENGTH = 5;
export const PLATEAU_TOLERANCE_PERCENT = 3;

// collection names

//

export const TIME_AGG_LEVEL = {
   MINUTE: 'minute',
   HOUR: 'hour',
   DAY: 'day',
};

export const POSTFIX_MODEL_MAP = {};
