import { CarpenterServer  } from "./index.js";
async function main(params) {
    const carpenter = new CarpenterServer();
    await carpenter.init({demoData: true});

    await carpenter.DatabaseInitialize();      
    carpenter.Start();
}

main();

