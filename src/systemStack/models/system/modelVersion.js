import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../../index.js";

export default class ModelVersion extends CarpenterModel {
    static modelVersion = 1;
    static sequelizeDefinition = {
        model_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, },
        description: { type: DataTypes.STRING, allowNull: false, },
        version: { type: DataTypes.INTEGER, allowNull: false, comment: 'Server software version' },
        available_local: { type: DataTypes.BOOLEAN, allowNull: false, default: false }
    }

    static sequelizeConnections = [
    ];

    static seedDataCore = [
    ]

    static seedDataDemo = [
    ];
};
