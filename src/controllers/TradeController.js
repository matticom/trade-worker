import { findAsset } from '../api/yahoo';

export async function searchAssets(req, res) {
   const searchTerm = req.query.searchTerm;
   const found = await findAsset(searchTerm);
   return res.status(200).send({ result: found });
}

export async function buyAsset(req, res) {
   const symbol = req.query.symbol;
}
