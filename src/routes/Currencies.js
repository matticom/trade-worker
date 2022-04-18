import express from 'express';
import { createCurrency, createTradingPlatform } from '../db/ModelService';

import { CurrencyCollection, TradingPlatformCollection } from '../db/schemas';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
   const collections = await CurrencyCollection.find();
   res.status(200).send({ data: collections });
});

router.post('/', async (req, res) => {
   const newPlatform = createCurrency(req.body); // check for data validity is missing
   await newPlatform.save();
   res.status(200).send();
});

export default router;
