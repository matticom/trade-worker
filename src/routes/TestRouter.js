import express from 'express';
import { getCollections } from '../db/mongoDb';
const router = express.Router({ mergeParams: true });

router.get('/test', async (req, res) => {
   const collections = await getCollections();
   res.status(200).send({ data: collections });
});

export default router;
