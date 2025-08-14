import CarpenterModel from "../../lib/CarpenterModel.js";
import CarpenterModelRelationship from "../../lib/CarpenterModelRelationship.js";
import { DataTypes } from "sequelize";

export default class Organization extends CarpenterModel {
    static sequelizeDefinition = {
        organizationId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        otpRequired: { type: DataTypes.TINYINT, allowNull: true, },
        name: { type: DataTypes.STRING, allowNull: false, },        
        description: { type: DataTypes.STRING, allowNull: true, },        
        contactEmail: { type: DataTypes.STRING, allowNull: true, },        
    }

    static sequelizeConnections = [
    ];

    static seedDataCore = [
        {
            organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            otpRequired: 0,
            name: "Web Farm Solutions",
            description: "Primary Test Organization",
        },        
    ]

    static seedDataDemo = [
    ];
};
