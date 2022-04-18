import Mongoose from 'mongoose';
import { assets } from '../Assets';
import { TIME_AGG_LEVEL } from '../constants';
import { currencies } from '../Currencies';
import { cutStrToMax } from '../tools/General';
import { tradingPlatforms } from '../TradePlatforms';
import { db } from './mongoDb';
import {
   AssetTimeAggChartCollection,
   AssetCollection,
   ChartDataPointSchema,
   CurrencyCollection,
   Currency_CollectionName,
   TradingPlatformCollection,
   TradingPlatform_CollectionName,
   Asset_CollectionName,
   AssetTimeAggChart_CollectionName,
} from './schemas';

export async function createInitialDbSetup() {
   await db.collection(Currency_CollectionName).deleteMany({});
   const currenciesActions = [];
   currencies.forEach((currency) => {
      const newCurrency = createCurrency(currency);
      currenciesActions.push(newCurrency.save());
   });
   await Promise.all(currenciesActions);

   await db.collection(TradingPlatform_CollectionName).deleteMany({});
   const platformActions = [];
   tradingPlatforms.forEach((platform) => {
      const newPlatform = createTradingPlatform(platform);
      platformActions.push(newPlatform.save());
   });
   await Promise.all(platformActions);

   await db.collection(Asset_CollectionName).deleteMany({});
   await db.collection(AssetTimeAggChart_CollectionName).deleteMany({});

   const assetActions = [];
   let assetTimeAggChartActions = [];
   assets.forEach((asset) => {
      const newAsset = createAsset(asset);
      assetActions.push(newAsset.save());
      assetTimeAggChartActions = [...assetTimeAggChartActions, ...createAssetTimeAggCharts(asset)];
   });
   await Promise.all(assetActions);
   await Promise.all(assetTimeAggChartActions);
}

export function getChartDataPointCollection(assetKey, timeAggLevel) {
   return Mongoose.model(`${assetKey}_${timeAggLevel}`, ChartDataPointSchema, `${assetKey}_${timeAggLevel}`);
}

export async function getAssetByKey(assetKey) {
   return await AssetCollection.findOne({ key: assetKey });
}

export async function getAssetTimeAggChart(assetKey, timeAggLevel) {
   console.log('assetKey :>> ', assetKey);
   return await AssetTimeAggChartCollection.findOne({ name: assetKey, timeAggLevel });
}

export function getChartDataPointName(assetKey, timeAggLevel) {
   return `${assetKey}_${timeAggLevel}`;
}

export function getAssetKey(assetName, assetSymbol, assetCurrency) {
   return `${cutStrToMax(assetName, 30)}_${assetSymbol}_${assetCurrency}`;
}

export function createCurrency(newCurrency) {
   const { name, symbol } = newCurrency;
   return new CurrencyCollection({ name, symbol });
}

export function createTradingPlatform(newPlatform) {
   const { name, tradeWeekend, tradeAnyTime, hours } = newPlatform;
   const modelData = { name, tradeWeekend, tradeAnyTime };

   if (hours !== undefined) {
      const { tradeStartMonFri, tradeEndMonFri, tradeStartSat, tradeEndSat, tradeStartSun, tradeEndSun } = hours;
      if (tradeStartMonFri) modelData.tradeStartMonFri = tradeStartMonFri;
      if (tradeEndMonFri) modelData.tradeEndMonFri = tradeEndMonFri;
      if (tradeStartSat) modelData.tradeStartSat = tradeStartSat;
      if (tradeEndSat) modelData.tradeEndSat = tradeEndSat;
      if (tradeStartSun) modelData.tradeStartSun = tradeStartSun;
      if (tradeEndSun) modelData.tradeEndSun = tradeEndSun;
   }
   return new TradingPlatformCollection(modelData);
}

export function createAsset(asset) {
   const { name, symbol, currency, url, selector, separatorChar, tradingPlatform } = asset;
   const newAsset = {
      key: getAssetKey(name, symbol, currency),
      name,
      symbol,
      currency,
      url,
      selector,
      separatorChar,
      tradingPlatform,
   };
   if (asset.isin !== undefined) newAsset.isin = asset.isin;
   return new AssetCollection(newAsset);
}

export function createAssetTimeAggCharts(asset) {
   const { name, symbol, currency, params } = asset;
   const newAssetTimeAggCharts = [];

   Object.keys(TIME_AGG_LEVEL).forEach((timeAggLevel) => {
      const { plateauMinLength, plateauTolerancePercent, peakPercent, peakDetectionTimeout } = params[timeAggLevel];
      const newAssetTimeAggChart = new AssetTimeAggChartCollection({
         name: getAssetKey(name, symbol, currency),
         timeAggLevel,
         plateauMinLength,
         plateauTolerancePercent,
         peakPercent,
         peakDetectionTimeout,
      });
      newAssetTimeAggCharts.push(newAssetTimeAggChart.save());
   });
   return newAssetTimeAggCharts;
}
