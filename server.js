import { CarpenterServer  } from "./index.js";
async function main(params) {
    const carpenter = new CarpenterServer();
    await carpenter.init({dbConfig: { storage: 'database.sqlite', dialect: 'sqlite', logging: console.log }});

    await carpenter.DatabaseInitialize();      
    carpenter.Start();
}

main();

