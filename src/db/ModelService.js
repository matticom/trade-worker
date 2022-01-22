import Mongoose from 'mongoose';
import { DAY_COLLECTION_POSTFIX, HOUR_COLLECTION_POSTFIX } from '../constants';
import { AssetSchema, ChartHistorySchema, ProfileSchema, TradeSchema } from './schemas';

export const Trade = Mongoose.model('trades', TradeSchema);
export const Profile = Mongoose.model('profiles', ProfileSchema);
export const Asset = Mongoose.model('assets', AssetSchema);

export const assetHistoryModels = new Map();

export function createInitialModels(name, currency, collection) {
   const MinuteModel = Mongoose.model(collection, ChartHistorySchema, collection);
   const HourModel = Mongoose.model(
      `${collection}${HOUR_COLLECTION_POSTFIX}`,
      ChartHistorySchema,
      `${collection}${HOUR_COLLECTION_POSTFIX}`,
   );
   const DayModel = Mongoose.model(
      `${collection}${DAY_COLLECTION_POSTFIX}`,
      ChartHistorySchema,
      `${collection}${DAY_COLLECTION_POSTFIX}`,
   );
   assetHistoryModels.set(collection, { name, currency, collection, MinuteModel, HourModel, DayModel });
   // return MinuteModel;
}
