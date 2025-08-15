import path from "path";

export { modelList, modelSeedOrder } from './models/index.js';
export * as routes from './routes/index.js';
export const jobs = [];
export const publicPath= path.join(import.meta.dirname,'public');
export const componentPath = path.join(import.meta.dirname,'components');