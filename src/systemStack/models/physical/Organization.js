import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class Organization extends CarpenterModel {
    static defaultReadAccess = "guest";
    static sequelizeDefinition = {
        organization_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        otpRequired: { type: DataTypes.TINYINT, allowNull: true, },
        name: { type: DataTypes.STRING, allowNull: false, },        
        description: { type: DataTypes.STRING, allowNull: true, },        
        contactEmail: { type: DataTypes.STRING, allowNull: true, },        
    }

    static sequelizeConnections = [
    ];

    static seedDataCore = [
        {
            organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            otpRequired: 0,
            name: "Web Farm Solutions",
            description: "Primary Test Organization",
        },
        {
            organization_id: "00000000-0000-0000-0000-000000000000",
            otpRequired: 0,
            name: "Public Access",
            description: "Public access organization for guest users.",
        }
    ]

    static seedDataDemo = [
    ];
};
