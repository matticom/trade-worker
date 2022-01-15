import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/trade_vision', { useNewUrlParser: true, useUnifiedTopology: true });
export const db = mongoose.connection;

let getCollectionsFn = null;
db.once('open', function () {
   getCollectionsFn = async function () {
      return db.db.listCollections().toArray();
   };
});

export async function getCollections() {
   return await getCollectionsFn();
}
