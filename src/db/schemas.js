import Mongoose from 'mongoose';

export const Trade_CollectionName = 'Trades';
export const TradeSchema = new Mongoose.Schema({
   action: { type: String, required: true },
   date: { type: Date, required: true },
   balance: { type: Number, required: true },
   asset: { type: Mongoose.ObjectId, required: true },
   pieces: { type: Number, required: true },
   price: { type: Number, required: true },
   profile: { type: Mongoose.ObjectId, required: true },
});

export const Profile_CollectionName = 'Profiles';
export const ProfileSchema = new Mongoose.Schema({
   name: { type: String, required: true },
});

export const Asset_CollectionName = 'Assets';
export const AssetSchema = new Mongoose.Schema({
   name: { type: String, required: true },
   symbol: { type: String, required: true }, // potencially by yahoo API --> get historical data
   isin: { type: String, required: false }, // other API
   currency: { type: String, required: true },
});

export const Currency_CollectionName = 'Currencies';
export const CurrencySchema = new Mongoose.Schema({
   name: { type: String, required: true },
   symbol: { type: String, required: true },
});

// collection name creation is dynamical
// collection instance name = AssetChartSchema.name_AssetChartSchema.timeAggLevel
export const ChartDataPointSchema = new Mongoose.Schema({
   value: { type: Number, required: true },
   date: { type: Date, required: true },
});

export const AssetChart_CollectionName = 'AssetCharts';
export const AssetChartSchema = new Mongoose.Schema({
   name: { type: String, required: true }, // AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency
   timeAggLevel: { type: String, required: true },
});

export const Poi_CollectionName = 'POIs';
export const PoiSchema = new Mongoose.Schema({
   chartName: { type: String, required: true }, // AssetChartSchema.name_AssetChartSchema.timeAggLevel
   value: { type: Number, required: true },
   date: { type: Date, required: true },
   type: { type: String, required: true },
   threshold: { type: Number, required: false },
});

export const TradingPlatform_CollectionName = 'TradingPlatforms';
export const TradingPlatformSchema = new Mongoose.Schema({
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

export const ObservedAsset_CollectionName = 'ObservedAssets';
export const ObservedAssetSchema = new Mongoose.Schema({
   name: { type: String, required: true }, // AssetSchema.name[0-X]_AssetSchema.symbol_AssetSchema.name_currency
   url: { type: String, required: true },
   selector: { type: String, required: true },
   separatorChar: { type: String, required: true }, // DE_FORMAT || EN_FORMAT
   tradingPlatform: { type: String, required: true },
});
