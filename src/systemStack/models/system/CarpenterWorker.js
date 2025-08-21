import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../../index.js";

export default class CarpenterWorker extends CarpenterModel {
    static sequelizeDefinition = {
        carpenter_worker_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        name: { type: DataTypes.STRING, allowNull: false, },
        description: { type: DataTypes.STRING, allowNull: true, },
        management_ip: { type: DataTypes.STRING, allowNull: true },
    }

    static sequelizeConnections = [
    ];

    static seedDataCore = [
        {
            carpenter_worker_id: "00000000-0000-0000-0000-000000000000",
            name: "localhost",
            management_ip:"127.0.0.1",
            description: "This is the default carpenter server for local development or single server deployments.",
        },
    ]

    static seedDataDemo = [
    ];
};
