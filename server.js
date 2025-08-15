import { CarpenterServer  } from "./index.js";
async function main(params) {
    const carpenter = new CarpenterServer();
    //Add any stacks here.
    await carpenter.DatabaseInitialize();      
    carpenter.Start();
}

main();

