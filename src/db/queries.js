import { TIME_AGG_LEVEL } from '../constants';
import { getChartDataPointCollection } from './ModelService';
import { Asset } from './schemas';

export async function findAssetBySymbol(symbol) {
   return await Asset.find({ symbol }).exec();
}

export async function createAsset(asset) {
   await new Asset(asset).save();
}

export async function getChartDataPoints(collection, startMoment, endMoment) {
   const bodyIsNeeded = startMoment !== undefined || endMoment !== undefined;
   if (!bodyIsNeeded) return await collection.find();

   const body = { date: {} };

   if (startMoment !== undefined) {
      body.date['$gte'] = startMoment.toDate();
   }

   if (endMoment !== undefined) {
      body.date['$lt'] = endMoment.toDate();
   }

   return await collection.find(body).lean();
}

export async function getLatestQuote(assetChartName) {
   const MinuteCollection = getChartDataPointCollection(assetChartName, TIME_AGG_LEVEL.MINUTE);
   return await MinuteCollection.find().sort({ date: -1 }).limit(1);
}

export async function saveLastPeak(collection, postfix, peak) {
   return await collection.find().sort({ date: -1 }).limit(1);
}
