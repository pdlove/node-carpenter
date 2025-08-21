import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobServer extends CarpenterModel {
    static sequelizeDefinition = {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'Human-readable server name' },
    hostname: { type: DataTypes.STRING, allowNull: false },
    port: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM('online', 'offline', 'maintenance'), defaultValue: 'offline', allowNull: false },
    maxConcurrentJobs: { type: DataTypes.INTEGER, defaultValue: 5, comment: 'Maximum number of jobs this server can run simultaneously' },
    currentJobCount: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Current number of running jobs' },
    capabilities: { type: DataTypes.JSON, allowNull: true, comment: 'What job languages/features this server supports' },
    lastHeartbeat: { type: DataTypes.DATE, allowNull: true, comment: 'Last time server checked in' },
    version: { type: DataTypes.STRING, allowNull: true, comment: 'Server software version' }
}

    static sequelizeConnections = [];
    static seedDataCore = [];
    static seedDataDemo = [
    ];
};