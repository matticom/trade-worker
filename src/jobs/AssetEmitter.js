const REFRESH = 'REFRESH';

const EventEmitter = require('events');

const assetEmitterRegistry = {};

export function createAssetEmitter(assetKey) {
   console.log('createAssetEmitter called :>> ', assetKey);
   if (assetEmitterRegistry[assetKey] === undefined) {
      assetEmitterRegistry[assetKey] = new EventEmitter();
   } else {
      console.log(`Asset emitter for ${assetKey} is already registered`);
   }
}

// job types e.g. long term analysis, or 1 day short term analysis
export function addJobToAssetEmitter(job) {
   const assetKey = job.getAssetKey();
   const handler = job.getHandler();
   const lifeTimeHandler = job.getJobEndDetectionHandler();
   if (assetEmitterRegistry[assetKey] !== undefined) {
      assetEmitterRegistry[assetKey].addListener(REFRESH, handler);
      assetEmitterRegistry[assetKey].addListener(REFRESH, lifeTimeHandler);
   } else {
      console.log(`Asset emitter for ${assetKey} has not been found`);
   }
}

export function removeJobFromAssetEmitter(job) {
   const assetKey = job.getAssetKey();
   const handler = job.getHandler();
   const lifeTimeHandler = job.getJobEndDetectionHandler();
   if (assetEmitterRegistry[assetKey] !== undefined) {
      assetEmitterRegistry[assetKey].removeListener(REFRESH, handler);
      assetEmitterRegistry[assetKey].removeListener(REFRESH, lifeTimeHandler);
   } else {
      console.log(`Asset emitter for ${assetKey} has not been found`);
   }
}

export function removeAllJobFromAssetEmitter(assetKey) {
   assetEmitterRegistry[assetKey].removeAllListeners();
}

export function sendRefresh(assetKey) {
   if (assetEmitterRegistry[assetKey] !== undefined) {
      assetEmitterRegistry[assetKey].emit(REFRESH);
   } else {
      console.log(`Asset emitter for ${assetKey} has not been found`);
   }
}

export function deleteAssetEmitter(assetKey) {
   removeAllJobFromAssetEmitter(assetKey);
   delete assetEmitterRegistry[assetKey];
}
