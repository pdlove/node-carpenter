import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobExecutionLog extends CarpenterModel {
    static sequelizeDefinition = {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    executionId: { type: DataTypes.UUID, allowNull: false, references: { model: JobExecution, key: 'id' } },
    level: { type: DataTypes.ENUM('info', 'warn', 'error', 'debug'), allowNull: false, defaultValue: 'info' },
    message: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.JSON,  comment: 'Additional structured data' },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}

    static sequelizeConnections = [];
    static seedDataCore = [];
    static seedDataDemo = [
    ];
};