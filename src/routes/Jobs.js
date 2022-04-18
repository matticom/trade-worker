import express from 'express';
import moment from 'moment';

import { getCollections } from '../db/mongoDb';
import { AssetCollection } from '../db/schemas';
import { addJob, jobRegistry } from '../jobs/jobs';

const router = express.Router({ mergeParams: true });

router.get('/test', async (req, res) => {
   console.log('test :>> ');
   const collections = await getCollections();
   res.status(200).send({ data: collections });
});

router.get('/', async (req, res) => {
   const collections = await AssetCollection.find();
   res.status(200).send({ data: collections });
});

router.get('/running', async (req, res) => {
   res.status(200).send({ data: jobRegistry });
});

router.post('/start', async (req, res) => {
   const { assetKey, name, type, start, end } = req.body;
   if (type === 'short term') {
      addJob(
         assetKey,
         name,
         type,
         () => {
            console.log('external short term job :>> ');
         },
         moment.utc(start),
         end !== undefined ? moment.utc(end) : undefined,
      );
   }
   console.log('job :>> ', req.body);
   res.status(200).send({});
});

export default router;
