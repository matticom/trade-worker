import Mongoose from 'mongoose';

export const TradeSchema = new Mongoose.Schema({
   action: { type: String, required: true },
   date: { type: Date, required: true },
   balance: { type: Number, required: true },
   asset: { type: Mongoose.ObjectId, required: true },
   pieces: { type: Number, required: true },
   price: { type: Number, required: true },
   profile: { type: Mongoose.ObjectId, required: true },
});

export const ProfileSchema = new Mongoose.Schema({
   name: { type: String, required: true },
});

export const AssetSchema = new Mongoose.Schema({
   name: { type: String, required: true },
   symbol: { type: String, required: true },
});

// name = collection
export const ChartHistorySchema = new Mongoose.Schema({
   price: { type: Number, required: true },
   date: { type: Date, required: true },
});
