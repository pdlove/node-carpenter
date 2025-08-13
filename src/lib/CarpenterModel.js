import pluralize from "pluralize";
import CarpenterModelRelationship from "./CarpenterModelRelationship.js";
export { Op, DataTypes } from "sequelize";

export class CarpenterModel {
    static carpenterServer = null;
    static preferredDatabase = 'sql';
    static sqlSchemaName = null; // If not set, the default schema will be used.
    static sqlTableName = null; // If not set, the table name will be the modelName pluralized and lowercased.
    static sqlCustomTimestamps = false; // If true, timestamps will not be created automatically by Sequelize

    static seedDataCore = null; //This should be an array of items when seeding is required.
    static seedDataDemo = null; //This should be an array of items when seeding the demo data. Not for production use.

    static filterRequired = false; // If true, the browseObjects method will throw an error if no filter is provided to prevent accidental data exposure.
    static defaultBrowsePageSize = 0; // 0 means no limit

    static autoRoutes = true; //If true, the default routes will be created for this model.
    /* Routes are also created for the views with GET verbs:
        GET /api/data/{modelName}/ - Browse view
        GET /api/data/{modelName}/0 - Get defaults for new object
        GET /api/data/{modelName}/{id} - Read object data.
        POST /api/data/{modelName}/{id} - Create new object
        PUT /api/data/{modelName}/{id} - Update existing object
        DELETE /api/data/{modelName}/{id} - Delete object
        GET /api/data/{modelName}/{id}/{relationshipName} - Browse objects that are part of a relationship
    */

    static defaultCreateAccess = 'admin'; // What accounts will be able to create data? This can be refined with application-specific groups but built-in groups are: admin, user, public
    static defaultEditAccess = 'admin'; // What accounts will be able to modify data? This can be refined with application-specific groups but built-in groups are: admin, user, public
    static defaultReadAccess = 'admin'; // What accounts will be able to read data? This can be refined with application-specific groups but built-in groups are: admin, user, public
    static defaultDeleteAccess = 'admin';
    static defaultAccessFilter = null; // This is a filter that will be applied to all operations. It can be used to limit access to certain data based on the user or other criteria.


    static sequelizeDefinition = {};
    static sequelizeConnections = [];
    static sequelizeRelationships = null;
    static sequelizeOptions = {};
    static sequelizeObject = null;

    static primaryKey = null;

    static carpenter = null;
    static seedDataCore=[];
    static seedDataDemo=[];
    constructor() {
        for (const fieldName in this.constructor.sequelizeDefinition) {
            console.log(fieldName);
        }
    }

    static sequelizeDefine(sequelize, DataTypes) {
        let tableOptions = {};
        if (this.sqlSchemaName) tableOptions.schema = this.sqlSchemaName;
        tableOptions.tableName = (this.tableName || pluralize(this.name));
        //Convert the tableName from PascalCase to snake_case for db compatablitiy.
        tableOptions.tableName = tableOptions.tableName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        if (this.sqlCustomTimestamps) tableOptions.timestamps = false;
        const myKey = Object.values(this.sequelizeDefinition).find((field) => field.primaryKey);
        if (myKey) {
            if (!myKey.defaultValue && (myKey.type == DataTypes.UUIDV4||myKey.type == DataTypes.UUID)) {
                myKey.defaultValue = DataTypes.UUIDV4;
            }
        }
        this.sequelizeObject = sequelize.define(this.name, this.sequelizeDefinition, tableOptions);
        if (this.sequelizeObject)
            this.primaryKey = Object.keys(this.sequelizeObject.rawAttributes).find((key) => this.sequelizeObject.rawAttributes[key].primaryKey);
        return this.sequelizeObject;
    }

    static async browseObjects({ filter, sortOrder, pageSize, pageNum, relationships, attributes, nest=false, raw=false }) {        
        if (this.filterRequired && !filter) throw new Error("Filter is required");

        //If filter is a string, determine if it contains a JSON object and parse if so.
        if (typeof filter === 'string') {
            try {
                filter = JSON.parse(filter);
            } catch (err) {
                filter = parseWhereClause(filter);
            }
        }
        //TODO: respect Default Authorization Query for Reads

        if (!pageSize) pageSize = 0;
        if (!pageNum) pageNum = 1;
        const offset = (pageNum - 1) * pageSize;
        const limit = pageSize;

        // Construct the order clause
        let order = [];
        if (sortOrder) {
            order = sortOrder.split(',').map(order => {
                const [field, direction] = order.trim().split(/\s+/);
                return [field, direction.toUpperCase() || 'ASC'];
            });
        }

        // Construct the options object dynamically
        const options = {
            where: filter,
            order, // Adjust the sort field as needed
            raw,
            nest
        };

        const relationshipsToFetch = {};
        if (relationships) {
            if (relationships.length > 0) {
                //loop through the subobects to find them in this.carpenterServer.models
                for (const relationName of relationships) {
                    const relationship = this.sequelizeObject.associations[relationName];
                    if (!relationship) throw new Error ("Relationship Not Found! Accessing model "+this.name+" with relationship "+relationName);
                    relationshipsToFetch[relationName]={model: relationship.toTarget}
                    if (submodel) {
                        relationshipsToFetch[relationName] = { model: submodel.sequelizeObject };
                    }
                }
            }
        }

        if (attributes) {
            options.attributes = [];
            //Attributes will be an array of field names. They might be fully qualified, example: "stack.model.field" or just "field".
            //If the attribute is not fully qualified then we need to find the model that has the field, first the current model then loop through the subobjects.
            for (const attribute of attributes) {
                let model = '';
                let field = attribute;
                let isValid = false;

                //If the attribute is qualified then break it up.
                if (attribute.includes('.')) {
                    const parts = attribute.split('.');
                    if (parts.length === 3) {
                        // Fully qualified: stack.model.field
                        model = parts[0] + '.' + parts[1]; //Qualified Model Name
                        field = parts[2];
                    } else if (parts.length === 2) {
                        // Partially qualified: model.field - Stack is automatically the current one
                        model = this.stackName + '.' + parts[1]; //Qualified Model Name
                        field = parts[2];
                    }
                } else {
                    // Unqualified: field. Searching this model and then submodels.
                    if (this.sequelizeDefinition[attribute]) {
                        //This is on the current model.
                        model = this.stackName + '.' + this.modelName;
                        isValid = true;
                    } else {
                        for (const subobject in relationshipsToFetch) {

                            if (relationshipsToFetch[subobject].model.rawAttributes[attribute]) {
                                //This is on a submodel.
                                model = subobject;
                                isValid = true;
                            }
                            break;
                        }
                    }
                }
                if (!isValid) {
                    console.error("Attribute not found. " + attributes);
                }
                if (model == this.stackName + '.' + this.modelName) {
                    //This field was found in the current model.
                    options.attributes.push(field);
                } else {
                    if (!relationshipsToFetch[model].attributes)
                        relationshipsToFetch[model].attributes = [];
                    relationshipsToFetch[model].attributes.push(field);
                }
            }
        }

        options.include = Object.values(relationshipsToFetch);

        if (limit !== 0) {
            options.offset = offset;
            options.limit = limit;
        }

        const { count, rows } = await this.sequelizeObject.findAndCountAll(options);

        // Create an array of column names with custom getters.
        //Loop through sequelizeDefinition and record the name of entries which have a get function.
        const customGetters = {};
        for (const fieldName in this.sequelizeDefinition) {
            if (this.sequelizeDefinition[fieldName].get) {
                customGetters[fieldName] = this.sequelizeDefinition[fieldName].get;
            }
        }
        //Get Custom Getters from any included tables
        for (const subobject in relationshipsToFetch) {
            let objectModel = this.carpenterServer.models[subobject];
            for (const fieldName in objectModel.sequelizeDefinition) {
                if (objectModel.sequelizeDefinition[fieldName].get) {
                    customGetters[objectModel.modelName + '.' + fieldName] = objectModel.sequelizeDefinition[fieldName].get;
                }
            }
        }

        //Now if there is anything in custom getters, we need to loop through the rows and apply the custom getters.
        if (Object.keys(customGetters).length > 0) {
            for (const row of rows) {
                for (const fieldName in customGetters) {
                    if (fieldName)
                        row[fieldName] = customGetters[fieldName](row[fieldName]);
                }
            }
        }
        if (pageSize == 0) return rows;
        return {
            pageNum,
            pageSize,
            total: count,
            items: rows
        };
    }

    static async readObject(id) {
        if (!req.session.inGroup(this.defaultReadAccess)) throw new Error("No permission.")
        if (id == 0) {
            return this.sequelizeObject.build();
        }
        //TODO: Tweaks for Composite Keys Needed
        //TODO: Verify Authorization
        return await this.sequelizeObject.findByPk(id);
    }

    static async addOrEditObject(data) {
        //TODO: Tweaks for Composite Keys Needed
        const id = data[this.primaryKey];
        if (!id)
            return this.addObject(data);
        else 
            return this.editObject(data);
    }

    static async editObject(data) {
        //Long Term: Tweaks for Composite Keys Needed
        await this.sequelizeObject.update(data, { where: { [this.primaryKey]: data[this.primaryKey] } });
        return await this.sequelizeObject.findByPk(data[this.primaryKey]);
    }

    static async addObject(data) {
        return await this.sequelizeObject.create(data);
    }

    static async deleteObject(id) {
        //TODO: Tweaks for Composite Keys Needed
        return await this.sequelizeObject.destroy({ where: { [this.primaryKey]: id } });
    }

    static apiRoutes() {
        return [ //Authentication is actually handled in the route functions here
            { path: ('/api/data/' + this.name.toLowerCase() + '/'), method: "GET", function: this.defaultGetRoute.bind(this), authenticationRequired: false },
            { path: ('/api/data/' + this.name.toLowerCase() + '/:id/:relationship'), method: "GET", function: this.defaultGetRoute.bind(this), authenticationRequired: false }, 
            { path: ('/api/data/' + this.name.toLowerCase() + '/:id'), method: "PUT", function: this.defaultPutRoute.bind(this), authenticationRequired: false },
            { path: ('/api/data/' + this.name.toLowerCase() + '/'), method: "POST", function: this.defaultPostRoute.bind(this), authenticationRequired: false },
            { path: ('/api/data/' + this.name.toLowerCase() + '/:id'), method: "DELETE", function: this.defaultDeleteRoute.bind(this), authenticationRequired: false },
        ]
    }
    static async defaultGetRoute(req, res) {
        try {
            if (!req.session.inGroup(this.defaultReadAccess)) throw new Error("No permission.")
            const acceptHeader = res.req.headers["accept"].toLowerCase() || "text/html";
            let pageNum = req.query.page
            if (pageNum === undefined) pageNum = 1;
            let pageSize = req.query.pageSize;
            if (pageSize === undefined) pageSize = this.defaultBrowsePageSize;
            const filter = req.query.filter;
            if (filter) filter = JSON.parse(filter);
            const sortOrder = req.query.sortOrder;
            const id = req.params.id;            
            const relationship = req.params.relationship
            if (id=='relationships') {
                res.json(Object.keys(this.sequelizeRelationships));
                return;
            }
            if (id) {
                let data = await this.readObject(id);
                if (!relationship) {
                    res.json(data);
                    return;
                }
                const relObject = this.sequelizeRelationships[relationship];
                if (relObject.parentModelName==this.name) {
                    data = await data[relObject.parentGet]();
                }
                if (relObject.childModelName==this.name) {
                    data = await data[relObject.childGet]();
                }
                res.json(data);
                return;
                
            } else {
                const data = await this.browseObjects({ filter, sortOrder, pageSize, pageNum });
                res.json(data);
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultPostRoute(req, res) {
        try {
        if (!req.session.inGroup(this.defaultCreateAccess)) throw new Error("No permission.")
            const data = await this.addObject(req.body);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultPutRoute(req, res) {
        try {
            
        if (!req.session.inGroup(this.defaultEditAccess)) throw new Error("No permission.")
            const data = await this.editObject(req.body);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultDeleteRoute(req, res) {
        try {
        if (!req.session.inGroup(this.defaultDeleteAccess)) throw new Error("No permission.")
            const data = await this.deleteObject(req.params.id);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

}
//module.exports = { CarpenterModel, DataTypes };
