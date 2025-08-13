import * as models1 from './webmanager/Clusters.js';
import * as models2 from './webmanager/Services.js';
import * as models3 from './system/UserSystem.js';
//import * as models4 from './WebApps.js';
const allModels = { ...models1, ...models2, ...models3}//, ...models4}

export { allModels };
export function loadModels(carpenterServer) {
    for (const modelName in allModels) {
        carpenterServer.AddModel(allModels[modelName]);
    }
}
export const seedOrder = ['Organization', 'User', 'SecurityGroup', 'SecurityGroupGroupMembership', 'SecurityGroupUserMembership', 'UserSession', //UserSystem
    "ServiceGroup", "Service", "ServiceVersion", "ServiceVersionConfig", //Services
    "Cluster", "ClusterServices", "ClusterServiceConfig", "Server", "ServerService", "ServerServiceConfig" //Clusters
];