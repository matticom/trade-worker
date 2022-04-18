import Mongoose from 'mongoose';

const Trade_CollectionName = 'Trades';
const TradeSchema = new Mongoose.Schema({
   action: { type: String, required: true },
   date: { type: Date, required: true },
   balance: { type: Number, required: true },
   asset: { type: Mongoose.ObjectId, required: true },
   pieces: { type: Number, required: true },
   price: { type: Number, required: true },
   profile: { type: Mongoose.ObjectId, required: true },
});

export const TradeCollection = Mongoose.model(Trade_CollectionName, TradeSchema, Trade_CollectionName);

const Profile_CollectionName = 'Profiles';
const ProfileSchema = new Mongoose.Schema({
   name: { type: String, required: true },
});

export const ProfileCollection = Mongoose.model(Profile_CollectionName, ProfileSchema, Profile_CollectionName);

const Asset_CollectionName = 'Assets';
const AssetSchema = new Mongoose.Schema({
   key: { type: String, required: true },
   name: { type: String, required: true },
   symbol: { type: String, required: true }, // potencially by yahoo API --> get historical data
   isin: { type: String, required: false }, // other API
   currency: { type: String, required: true },
   url: { type: String, required: true },
   selector: { type: String, required: true },
   separatorChar: { type: String, required: true }, // DE_FORMAT || EN_FORMAT
   tradingPlatform: { type: String, required: true },
});

export const AssetCollection = Mongoose.model(Asset_CollectionName, AssetSchema, Asset_CollectionName);

const Currency_CollectionName = 'Currencies';
const CurrencySchema = new Mongoose.Schema({
   name: { type: String, required: true },
   symbol: { type: String, required: true },
});

export const CurrencyCollection = Mongoose.model(Currency_CollectionName, CurrencySchema, Currency_CollectionName);

// collection name creation is dynamical
// collection instance name = AssetChartSchema.name_AssetChartSchema.timeAggLevel
// e.g. Gold_GOLD_EUR_day
export const ChartDataPointSchema = new Mongoose.Schema({
   value: { type: Number, required: true },
   date: { type: Date, required: true },
});

// e.g. name: Gold_GOLD_EUR, timeAggLevel: DAY
const AssetChart_CollectionName = 'AssetCharts';
const AssetChartSchema = new Mongoose.Schema({
   name: { type: String, required: true }, // AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency
   timeAggLevel: { type: String, required: true },
   plateauMinLength: { type: Number, required: true },
   plateauTolerancePercent: { type: Number, required: true },
   peakPercent: { type: Number, required: true },
   peakDetectionTimeout: { type: Number, required: true },
});

export const AssetChartCollection = Mongoose.model(
   AssetChart_CollectionName,
   AssetChartSchema,
   AssetChart_CollectionName,
);

const Poi_CollectionName = 'POIs';
const PoiSchema = new Mongoose.Schema({
   chartName: { type: String, required: true }, // AssetChartSchema.name_AssetChartSchema.timeAggLevel
   value: { type: Number, required: true },
   date: { type: Date, required: true },
   type: { type: String, required: true },
   dateStr: { type: String },
   criteria: { type: String },
   detectionDate: { type: String },
});

export const PoiCollection = Mongoose.model(Poi_CollectionName, PoiSchema, Poi_CollectionName);

const TradingPlatform_CollectionName = 'TradingPlatforms';
const TradingPlatformSchema = new Mongoose.Schema({
   name: { type: String },
   tradeStartMonFri: { type: String },
   tradeEndMonFri: { type: String },
   tradeStartSat: { type: String },
   tradeEndSat: { type: String },
   tradeStartSun: { type: String },
   tradeEndSun: { type: String },
   tradeWeekend: { type: Boolean, required: true },
   tradeAnyTime: { type: Boolean, required: true },
});

export const TradingPlatformCollection = Mongoose.model(
   TradingPlatform_CollectionName,
   TradingPlatformSchema,
   TradingPlatform_CollectionName,
);

// export const ObservedAsset_CollectionName = 'ObservedAssets';
// export const ObservedAssetSchema = new Mongoose.Schema({
//    name: { type: String, required: true }, // AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency
//    url: { type: String, required: true },
//    selector: { type: String, required: true },
//    separatorChar: { type: String, required: true }, // DE_FORMAT || EN_FORMAT
//    tradingPlatform: { type: String, required: true },
// });
