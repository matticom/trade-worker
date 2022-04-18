import Mongoose from 'mongoose';

export const Trade_CollectionName = 'Trades';
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

export const Asset_CollectionName = 'Assets';
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

export const Currency_CollectionName = 'Currencies';
const CurrencySchema = new Mongoose.Schema({
   name: { type: String, required: true },
   symbol: { type: String, required: true },
});

export const CurrencyCollection = Mongoose.model(Currency_CollectionName, CurrencySchema, Currency_CollectionName);

// collection name creation is dynamical
// assetKey = AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency
// collection instance name = assetKey_AssetTimeAggChartSchema.timeAggLevel
// e.g. Gold_GOLD_EUR_day
export const ChartDataPointSchema = new Mongoose.Schema({
   value: { type: Number, required: true },
   date: { type: Date, required: true },
});

// e.g. name: Gold_GOLD_EUR, timeAggLevel: DAY
export const AssetTimeAggChart_CollectionName = 'AssetTimeAggCharts';
const AssetTimeAggChartSchema = new Mongoose.Schema({
   name: { type: String, required: true }, // AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency = assetKey
   timeAggLevel: { type: String, required: true },
   plateauMinLength: { type: Number, required: true },
   plateauTolerancePercent: { type: Number, required: true },
   peakPercent: { type: Number, required: true },
   peakDetectionTimeout: { type: Number, required: true },
});

export const AssetTimeAggChartCollection = Mongoose.model(
   AssetTimeAggChart_CollectionName,
   AssetTimeAggChartSchema,
   AssetTimeAggChart_CollectionName,
);

const Poi_CollectionName = 'POIs';
const PoiSchema = new Mongoose.Schema({
   chartName: { type: String, required: true }, // AssetTimeAggChartSchema.name_AssetTimeAggChartSchema.timeAggLevel
   value: { type: Number, required: true },
   date: { type: Date, required: true },
   type: { type: String, required: true },
   dateStr: { type: String },
   criteria: { type: String },
   detectionDate: { type: String },
});

export const PoiCollection = Mongoose.model(Poi_CollectionName, PoiSchema, Poi_CollectionName);

export const TradingPlatform_CollectionName = 'TradingPlatforms';
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
