import express from 'express';
import { findAsset } from '../api/yahoo';
import { createAsset, createAssetTimeAggCharts } from '../db/ModelService';
import { AssetCollection, AssetTimeAggChartCollection } from '../db/schemas';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
   const collections = await AssetCollection.find();
   res.status(200).send({ data: collections });
});

router.post('/charts', async (req, res) => {
   const assetKey = req.body.assetKey; // using params would be better but ([A-Za-z0-9_]) constraint
   console.log('assetKey :>> ', assetKey);
   const assetTimeAggCharts = await AssetTimeAggChartCollection.find({ name: assetKey });
   res.status(200).send({ data: assetTimeAggCharts });
});

router.post('/', async (req, res) => {
   const newAsset = createAsset(req.body); // validation is missing!!!
   await newAsset.save();
   const assetTimeAggCharts = createAssetTimeAggCharts(req.body); // validation is missing!!!
   await Promise.all(assetTimeAggCharts);
   res.status(200).send();
});

router.post('/find', async (req, res) => {
   const { searchTerm, region } = req.body;
   const result = await findAsset(searchTerm, region);
   res.status(200).send({ data: result });
});

router.post('/startObservation', async (req, res) => {
   const { searchTerm, region } = req.body;
   const result = await findAsset(searchTerm, region);
   res.status(200).send({ data: result });
});

export default router;
