import Mongoose from 'mongoose';
import { AssetSchema, ChartHistorySchema, ProfileSchema, TradeSchema } from './schemas';

export const Trade = Mongoose.model('trades', TradeSchema);
export const Profile = Mongoose.model('profiles', ProfileSchema);
export const Asset = Mongoose.model('assets', AssetSchema);

export const assetHistoryModels = new Map();

export function createInitialModels(name, currency, collection) {
   const MinuteModel = Mongoose.model(collection, ChartHistorySchema, collection);
   const HourModel = Mongoose.model(`${collection}_hour`, ChartHistorySchema, `${collection}_hour`);
   const DayModel = Mongoose.model(`${collection}_day`, ChartHistorySchema, `${collection}_day`);
   assetHistoryModels.set(collection, { name, currency, collection, MinuteModel, HourModel, DayModel });
   // return MinuteModel;
}
