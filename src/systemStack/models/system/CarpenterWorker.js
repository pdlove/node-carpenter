import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../../index.js";

export default class CarpenterWorker extends CarpenterModel {
    static sequelizeDefinition = {
        carpenter_worker_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, },
        description: { type: DataTypes.STRING, allowNull: true, },
        management_ip: { type: DataTypes.STRING, allowNull: true },
        maxConcurrentJobs: { type: DataTypes.INTEGER, defaultValue: 5, comment: 'Maximum number of jobs this server can run simultaneously' },
        currentJobCount: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Current number of running jobs' },
        capabilities: { type: DataTypes.JSON, allowNull: true, comment: 'What job languages/features this server supports' },
        lastHeartbeat: { type: DataTypes.DATE, allowNull: true, comment: 'Last time server checked in' },
        version: { type: DataTypes.STRING, allowNull: true, comment: 'Server software version' }
    }

    static sequelizeConnections = [
    ];

    static seedDataCore = [
        {
            carpenter_worker_id: 0,
            name: "localhost",
            management_ip: "127.0.0.1",
            description: "This is the default carpenter server for local development or single server deployments.",
        },
    ]

    static seedDataDemo = [
    ];
};
