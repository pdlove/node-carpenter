import { CarpenterServer  } from "./index.js";
async function main(params) {
    const carpenter = new CarpenterServer();
    await carpenter.init({dbConfig: { storage: 'database.sqlite', dialect: 'sqlite', logging: false}, demoData: true, debugLevel: 2 });

    await carpenter.DatabaseInitialize();      
    carpenter.Start();
}

main();

