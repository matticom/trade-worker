import moment from 'moment';
import { addJobToAssetEmitter, removeAllJobFromAssetEmitter, removeJobFromAssetEmitter } from './AssetEmitter';

export const jobRegistry = {};

export function addJob(assetKey, name, type, handler, startMoment, endMoment) {
   const assetJobs = jobRegistry[assetKey] ? jobRegistry[assetKey] : [];
   console.log('assetJobs :>> ', assetJobs);
   if (assetJobs.some((job) => job.name === name)) {
      console.log(`Job name '${name}' already exists`);
      return;
   }
   const job = new Job(assetKey, name, type, handler, startMoment, endMoment);
   assetJobs.push(job);
   jobRegistry[assetKey] = assetJobs;
   addJobToAssetEmitter(job);
}

export function removeAllAssetJobs(assetKey) {
   delete jobRegistry[assetKey];
   removeAllJobFromAssetEmitter(assetKey);
}

class Job {
   constructor(assetKey, name, type, handler, start, end) {
      this.assetKey = assetKey;
      this.name = name;
      this.type = type;
      this.handler = handler;
      this.start = start;
      this.end = end;
   }

   getAssetKey() {
      return this.assetKey;
   }

   getHandler() {
      return this.handler;
   }

   getJobEndDetectionHandler() {
      return () => {
         if (this.endMoment !== undefined) {
            const now = moment.utc();
            if (now.isAfter(this.endMoment)) {
               removeJobFromAssetEmitter(this);
            }
         }
      };
   }
}
