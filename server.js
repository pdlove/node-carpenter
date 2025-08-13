import { CarpenterServer  } from "./index";
async function main(params) {
    const dbConfig = { storage: 'database.sqlite', dialect: 'sqlite', logging: console.log, define: { underscored: true, } };
    const carpenter = new CarpenterServer();
    await carpenter.DatabaseInitialize(dbConfig);
    const seededModels = await carpenter.SeedCoreData(models.seedOrder);
    await carpenter.SeedDemoData(seededModels,true); //Force the demo data to be seeded for models where the core data was seeded.
   
    carpenter.Start();

}

main();

