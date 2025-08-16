import { Sequelize, DataTypes } from "sequelize";
import express from "express";

import cookieParser from "cookie-parser"; // in app setup
import bodyParser from "body-parser";

import { tokenMiddleware } from "./authToken.js"
import path from "path";

export default class CarpenterServer {
    models = {}; // This is a dictionary of models, e.g. { 'user': CarpenterModel }
    modelSeedGroups = []; //List of arrays that will be seeded in order.
    routes = {}; // This is a dictionary of routes
    componentPaths = {}; // This is a dictionary of compiled preact files
    publicPaths = {}; // This is a dictionary of compiled preact files

    options = {
        useFrontEnd: true,
        startWebIndex: null, //If set, this becomes the index.html passed to the client. If null, the one from the system stack is used.
        startReact: '/part/system/App.jsx', //Allows overriding the default main.jsx. If null, the one from the system stack is used.
        debugLevel: 0, // 0 = No Debug, 1 = Basic Debug, 2 = Verbose Debug, 3 = Very Verbose Debug (Includes SQL Queries)
        demoData: false, //Determines if demo data is seeded.
        dbConfig: {
            storage: 'database.sqlite',
            dialect: 'sqlite',
            logging: null,
            define: { underscored: true, freezeTableName: true }
        },
        singleUserMode: false, // If true, the server will support multiple users and sessions.

    }
    sequelize = null;

    async init(options = {}) {
        // Shallow merge user options into class options
        this.options = { ...this.options, ...options };

        this.options.dbConfig.define = this.options.dbConfig.define || { underscored: true, freezeTableName: true }; // If no define was specified, use the default define options.
        this.options.dbConfig.define.underscored = true; // Use snake_case for column names - This is forced to be true for consistency. It CAN be overridden in the model definitions

        const systemStack = await import('../systemStack/index.js');
        this.addStack('system', systemStack.modelList, systemStack.modelSeedOrder, systemStack.routes, systemStack.jobs, systemStack.publicPath, systemStack.componentPath);
    }

    addStack(stackName, modelList, modelSeedOrder, routes, jobs, publicPath, componentPath) {
        if (this.debugLevel > 0) console.log(`Loading models for stack: ${stackName}`);
        for (const modelName in modelList) {
            if (this.debugLevel > 1) console.log(`Adding model: ${modelName}`);
            this.AddModel(modelList[modelName]);
        }
        this.modelSeedGroups.push(modelSeedOrder); // Add the default model seed group

        //Load System Routes
        if (this.debugLevel > 0) console.log(`Loading routes for stack: ${stackName}`);
        for (const routeName in routes) {
            if (this.debugLevel > 1) console.log(`Adding route: ${routes[routeName].path}`);
            this.AddRouteObject(routes[routeName]);
        }
        //Load System Public Path
        if (this.debugLevel > 0) console.log(`Loading public path for stack: ${stackName}`);
        if (stackName === 'system') {
            this.addPublicPath('/', publicPath); // Set the root public path for the system stack
        } else {
            this.addPublicPath(`/${stackName}`, publicPath); // Set the public path for the stack
        }


        if (this.debugLevel > 0) console.log(`Loading component path for stack: ${stackName}`);
        //this.addPreactComponent(defaultModels.preactComponents, path.join(this.frontEndPath, "components/"));
        this.addPreactComponentPath(componentPath, stackName); // Set the frontend path to the src/reactFiles directory
    }

    async DatabaseInitialize() {
        if (!this.models || Object.keys(this.models).length == 0) {
            throw new Error('No models have been added to the CarpenterServer. Please add models before initializing the database.');
        }

        //Initialize and test the database Connection.
        try {
            // Implementation for initializing the database
            this.sequelize = new Sequelize(this.options.dbConfig);

            // Test the connection
            await (async () => {
                try {
                    await this.sequelize.authenticate();
                    console.log('Database connection has been established successfully.');
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                    throw error;
                }
            })();
        } catch (error) {
            console.error('Error initializing database connection:', error);
            throw error;
        }

        //Loop through models and create sequelize objects for each model
        for (const modelName in this.models) {
            const model = this.models[modelName];
            if (model && model.sequelizeObject) {
                if (this.debugLevel > 0) console.log(`Model ${modelName} is already initialized.`);
            } else {
                // Initialize the model with Sequelize
                await model.sequelizeDefine(this.sequelize, Sequelize.DataTypes);
                if (this.debugLevel > 0) console.log(`Model ${modelName} initialized.`);
            }
        }

        //Loop through the object relationships and create the relationships
        for (const modelName in this.models) {
            const model = this.models[modelName];
            if (model && model.sequelizeObject) {
                for (const modelRelationship of model.sequelizeConnections) {
                    try {
                        await modelRelationship.resolveRelationship(this);
                    } catch (ex) {
                        throw new Error("Error processing relationship on model " + model.name + " with error " + ex);
                    }
                }

            }
        }

        await this.sequelize.sync({})

        // Seed the core data if needed
        for (const modelSeedGroup of this.modelSeedGroups) {
            const seededModels = await this.SeedCoreData(modelSeedGroup, false);
            console.log(`Seeded core data for models: ${seededModels.join(', ')}`);
            if (this.options.demoData) {
                await this.SeedDemoData(seededModels, true);
                console.log(`Seeded demo data for models: ${seededModels.join(', ')}`);
            }
        }
    }

    async SeedCoreData(modelList, force = false) {
        let seededModels = [];
        //Begin Seeding If Needed
        for (const modelName of modelList) {
            const model = this.models[modelName];
            const itemCount = await model.sequelizeObject.count();
            if (itemCount > 0 && !force) {
                if (this.debugLevel > 1) console.log(modelName + ' already exists, skipping seeding.');
                continue;
            }
            seededModels.push(modelName);
            if (model.seedDataCore.length > 0) {
                if (this.debugLevel > 0) console.log('Seeding Core Data for ' + modelName);
                for (const item of model.seedDataCore) {
                    await model.sequelizeObject.create(item);
                }
            }
        }
        return seededModels;
    }
    async SeedDemoData(modelList, force = false) {
        //Begin Seeding If Needed
        for (const modelName of modelList) {
            const model = this.models[modelName];
            const itemCount = await model.sequelizeObject.count();
            if (itemCount > 0 && !force) {
                if (this.debugLevel > 1) console.log(modelName + ' already exists, skipping seeding.');
                continue;
            }
            if (model.seedDataDemo.length > 0) {
                if (this.debugLevel > 0) console.log('Seeding Demo Data for ' + modelName);
                for (const item of model.seedDataDemo) {
                    await model.sequelizeObject.create(item);
                }
            }
        }
    }

    AddModel(model) {
        if (model && model.name) {
            this.models[model.name] = model;
            model.carpenterServer = this; // Set the carpenter reference in the model
        } else {
            throw new Error('Invalid model provided to AddModel');
        }
        if (model.autoRoutes) this.addAPIRoutes(model.apiRoutes())
    }

    AddModelSeedGroup(modelList) {
        if (Array.isArray(modelList) && modelList.length > 0) {
            this.modelSeedGroups.push(modelList);
        } else {
            throw new Error('Invalid model list provided to AddModelSeedGroup');
        }
    }

    AddRouteObject(route) {
        route.carpenterServer = this;
        this.addAPIRoutes(route.apiRoutes());
    }
    addAPIRoutes(routes) {
        for (const route of routes) {
            if (!this.routes[route.method]) this.routes[route.method] = { path: "", route: null, params: [] };
            let parentRoute = this.routes[route.method];
            //Break up the route into the parts so we can create the iterative objects
            const routeParts = route.path.split('/');
            for (let i = 0; i < routeParts.length; i++) {
                const part = routeParts[i];
                if (!part) continue;
                if (part[0] == ':') {
                    //This is a parameter
                    parentRoute.params.push(part.substring(1));
                } else {
                    //If it isn't a parameter then create and move to the next iteration (as needed)
                    if (!parentRoute[part]) parentRoute[part] = { path: (parentRoute.path + '/' + part), route: null, params: [] };
                    parentRoute = parentRoute[part];
                    parentRoute.params = [];
                }
            }
            parentRoute.route = route;
        }
        routes = routes;
    }
    addJobTemplate(jobTemplate) {
    }
    addPreactComponentPath(path, prefix) {
        if (this.debugLevel > 0) console.log(`Adding preact component path: ${path} with prefix: ${prefix}`);
        this.componentPaths[prefix] = path;
    }
    addPublicPath(webPath, publicPath) {
        if (this.debugLevel > 0) console.log(`Adding public path: ${publicPath}`);
        this.publicPaths[webPath] = publicPath;

    }
    addMenuItem(menuItem) {
    }

    Start() {
        const port = 8010;
        // Start the server, e.g. listen on a port, start the web server, etc.
        console.log('CarpenterServer started with models:', Object.keys(this.models));

        //TODO: Revisit how to include the frontend components in the project better.
        //Possibly simply pre-compile them into a module.
        //this.frontEndPath = path.resolve('./src/frontend/');
        //Initialize the Web API
        const app = express();
        this.expressAPI = app;

        // Add the redirect to this.options.startWebIndex
        if (this.options.startWebIndex) {
            app.get('/', (req, res) => {
                if (process.env.NODE_ENV === "production") {
                    // permanent redirect
                    res.redirect(301, this.options.startWebIndex);
                } else {
                    // temporary redirect while developing
                    res.redirect(302, this.options.startWebIndex);
                }
            });
        }

        app.use("/start.jsx", (req, res) => {
            res.type('text/javascript');
            res.send(`
import { h, render } from '/vendor/preact/preact.mjs';
import { App } from '${this.options.startReact}';

const root = document.getElementById('app');
render(h(App, null), document.getElementById('app'));
    `);
        });

        app.use(cookieParser());
        app.use(bodyParser.json());

        app.use(tokenMiddleware(this));
        app.use(this.customParser.bind(this));

        for (const webPath in this.publicPaths) {
            if (this.debugLevel > 0) console.log(`Serving public path: ${webPath} from ${this.publicPaths[webPath]}`);
            app.use(webPath, express.static(this.publicPaths[webPath]));
        }

        // Add Model route
        this.addAPIRoutes([{ path: ('/api/data'), method: "GET", function: (req, res) => res.json(Object.keys(this.models)), isAPI: true }])        
        app.listen(port, async () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    async Stop() {
        // Stop the server, e.g. close database connections, stop the web server, etc.
        console.log('CarpenterServer stopped');
    }

    async customParser(req, res, next) {
        console.log(`Custom Parser - URL: ${req.url} with user: ${req.user}`);
        let currentRoute = this.routes[req.method];
        let lastRoute = null;
        let paramNum = 0;

        //Break up the route into the parts so we can create the iterative objects    
        let myURL = req.url.toString().toLowerCase();
        const routeParts = myURL.split('?')[0].split('/'); //We split based on ? to get rid of any parameters after the last part of the URL.


        for (let i = 0; i < routeParts.length; i++) {
            const part = routeParts[i];
            if (!part) continue;
            if (paramNum < currentRoute.params.length) {
                //This is a parameter
                req.params[currentRoute.params[paramNum]] = part;
                paramNum += 1
                //Since we processed a parameter, skip this for route selection.
                continue;
            }
            if (currentRoute[part]) {
                //If the next part exists as a route, we'll move to it.
                currentRoute = currentRoute[part];
                if (currentRoute.route) lastRoute = currentRoute.route; //if there is a route associated with this path, update lastRoute.
                //Fill in the parameters with null.
                for (let j = 0; j < currentRoute.params.length; j++) {
                    req.params[currentRoute.params[i]] = null;
                }
                paramNum = 0; //Reset the parameter Number
            }
        }
        if (!lastRoute) {
            //If the route wasn't found, move to the next middleware.
            await next();
            return;
        }

        //Functions that are outside of this route infrastructure are on their own, but we'll refine the information
        let result = await lastRoute.function(req, res);
        if (!result) {
            //await next(); //If something failed, pass the buck.
        }
    }
}

