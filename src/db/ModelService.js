import Mongoose from 'mongoose';
import { assets } from '../Assets';
import { TIME_AGG_LEVEL } from '../constants';
import { currencies } from '../Currencies';
import { cutStrToMax } from '../tools/General';
import { tradingPlatforms } from '../TradePlatforms';
import { db } from './mongoDb';
import {
   AssetChartSchema,
   AssetChart_CollectionName,
   AssetSchema,
   Asset_CollectionName,
   ChartDataPointSchema,
   CurrencySchema,
   Currency_CollectionName,
   ObservedAssetSchema,
   ObservedAsset_CollectionName,
   ProfileSchema,
   TradeSchema,
   TradingPlatformSchema,
   TradingPlatform_CollectionName,
} from './schemas';

export const Trade = Mongoose.model('trades', TradeSchema);
export const Profile = Mongoose.model('profiles', ProfileSchema);
export const Asset = Mongoose.model('assets', AssetSchema);

export async function createInitialDbSetup(observedValues) {
   await db.collection(Currency_CollectionName).deleteMany({});
   const currenciesActions = [];
   currencies.forEach(({ name, symbol }) => {
      const CurrencyCollection = Mongoose.model(Currency_CollectionName, CurrencySchema, Currency_CollectionName);

      const newCurrency = new CurrencyCollection({ name, symbol });
      currenciesActions.push(newCurrency.save());
   });
   await Promise.all(currenciesActions);

   await db.collection(TradingPlatform_CollectionName).deleteMany({});
   const platformActions = [];
   Object.keys(tradingPlatforms).forEach((platformName) => {
      const PlatformCollection = Mongoose.model(
         TradingPlatform_CollectionName,
         TradingPlatformSchema,
         TradingPlatform_CollectionName,
      );

      const workingHourSetting = tradingPlatforms[platformName];
      const modelData = {
         name: platformName,
         tradeWeekend: workingHourSetting.tradeWeekend,
         tradeAnyTime: workingHourSetting.tradeAnyTime,
      };
      if (workingHourSetting.tradeStartMonFri !== undefined)
         modelData.tradeStartMonFri = workingHourSetting.tradeStartMonFri;
      if (workingHourSetting.tradeEndMonFri !== undefined) modelData.tradeEndMonFri = workingHourSetting.tradeEndMonFri;
      if (workingHourSetting.tradeStartSat !== undefined) modelData.tradeStartSat = workingHourSetting.tradeStartSat;
      if (workingHourSetting.tradeEndSat !== undefined) modelData.tradeEndSat = workingHourSetting.tradeEndSat;
      if (workingHourSetting.tradeStartSun !== undefined) modelData.tradeStartSun = workingHourSetting.tradeStartSun;
      if (workingHourSetting.tradeEndSun !== undefined) modelData.tradeEndSun = workingHourSetting.tradeEndSun;
      const newPlatform = new PlatformCollection(modelData);
      platformActions.push(newPlatform.save());
   });
   await Promise.all(platformActions);

   await db.collection(Asset_CollectionName).deleteMany({});
   const assetActions = [];
   assets.forEach((asset) => {
      const { name, symbol, currency } = asset;
      const AssetCollection = Mongoose.model(Asset_CollectionName, AssetSchema, Asset_CollectionName);
      const assetData = { name, symbol, currency };
      if (asset.isin !== undefined) assetData.isin = asset.isin;
      const newAsset = new AssetCollection(assetData);
      assetActions.push(newAsset.save());
   });
   await Promise.all(assetActions);

   await db.collection(ObservedAsset_CollectionName).deleteMany({});
   await db.collection(AssetChart_CollectionName).deleteMany({});

   const observedAssetActions = [];
   const assetChartActions = [];
   observedValues.forEach(({ name, symbol, currency, collection, url, selector, separatorChar, platform }) => {
      const ObservedValueCollection = Mongoose.model(
         ObservedAsset_CollectionName,
         ObservedAssetSchema,
         ObservedAsset_CollectionName,
      );
      const observedAssetName = getAssetChartName(name, symbol, currency);
      const newObservedAsset = new ObservedValueCollection({
         name: observedAssetName,
         url,
         selector,
         separatorChar,
         tradingPlatform: platform,
      });
      observedAssetActions.push(newObservedAsset.save());

      Object.keys(TIME_AGG_LEVEL).forEach((timeAggLevel) => {
         const AssetChartCollection = Mongoose.model(
            AssetChart_CollectionName,
            AssetChartSchema,
            AssetChart_CollectionName,
         );
         const newAssetChart = new AssetChartCollection({
            name: observedAssetName,
            timeAggLevel,
         });
         assetChartActions.push(newAssetChart.save());
      });
   });
   await Promise.all(observedAssetActions);
   await Promise.all(assetChartActions);
}

export function getChartDataPointCollection(assetChartName, timeAggLevel) {
   return Mongoose.model(
      `${assetChartName}_${timeAggLevel}`,
      ChartDataPointSchema,
      `${assetChartName}_${timeAggLevel}`,
   );
}

export function getChartDataPointName(assetChartName, timeAggLevel) {
   return `${assetChartName}_${timeAggLevel}`;
}

export function getAssetChartName(assetName, assetSymbol, assetCurrency) {
   return `${cutStrToMax(assetName, 30)}_${assetSymbol}_${assetCurrency}`;
}
