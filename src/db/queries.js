import { Asset } from './schemas';

export async function findAssetBySymbol(symbol) {
   return await Asset.find({ symbol }).exec();
}

export async function createAsset(asset) {
   await new Asset(asset).save();
}
