import express from 'express';
import { createTradingPlatform } from '../db/ModelService';

import { TradingPlatformCollection } from '../db/schemas';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
   const collections = await TradingPlatformCollection.find();
   res.status(200).send({ data: collections });
});

router.post('/', async (req, res) => {
   const newPlatform = createTradingPlatform(req.body); // check for data validity is missing
   await newPlatform.save();
   res.status(200).send();
});

export default router;
