import express from 'express';
import { findAsset } from '../api/yahoo';
import { shouldAskForPrice } from '../controllers/PlatformController';
import { createAsset, createAssetTimeAggCharts } from '../db/ModelService';
import { AssetCollection, AssetTimeAggChartCollection } from '../db/schemas';
import { activePages, startAssetPriceRecording, stopAssetPriceRecording } from '../services/ScrapeService';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
   const collections = await AssetCollection.find();
   res.status(200).send({ data: collections });
});

router.get('/:assetKey/charts', async (req, res) => {
   const assetKey = decodeURIComponent(req.params.assetKey); // using params would be better but ([A-Za-z0-9_]) constraint
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

router.get('/find', async (req, res) => {
   const { searchTerm, region } = req.query;
   const result = await findAsset(decodeURIComponent(searchTerm), region);
   res.status(200).send({ data: result });
});

router.get('/recordings', async (req, res) => {
   const activeRecordings = [];
   for (let index = 0; index < Object.keys(activePages).length; index++) {
      const assetKey = Object.keys(activePages)[index];
      const { price, selector, url, active, platform } = activePages[assetKey];
      const exchangeIsOpen = await shouldAskForPrice(platform);
      activeRecordings.push({ assetKey, price, selector, url, active, platform, exchangeIsOpen });
   }
   res.status(200).send(activeRecordings);
});

router.post('/recordings/:assetKey/start', async (req, res) => {
   const assetKey = decodeURIComponent(req.params.assetKey);
   await startAssetPriceRecording(assetKey);
   res.status(200).send();
});

router.post('/recordings/:assetKey/stop', async (req, res) => {
   const assetKey = decodeURIComponent(req.params.assetKey);
   stopAssetPriceRecording(assetKey);
   res.status(200).send();
});

export default router;
