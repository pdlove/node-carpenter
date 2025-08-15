import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class UserSession extends CarpenterModel {
    static sequelizeDefinition = {
        sessionId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        userId: { type: DataTypes.UUID, allowNull: false, },
        srcIPAddress: { type: DataTypes.STRING, allowNull: false, },
        userAgent: { type: DataTypes.STRING, allowNull: false, },
        startTime: { type: DataTypes.DATE, allowNull: false, },
        expireTime: { type: DataTypes.DATE, allowNull: false, },        
        lastUseTime: { type: DataTypes.DATE, allowNull: true, },
        status: { type: DataTypes.ENUM('Active', 'InActive', 'Logout', 'Expired', 'Terminated'), allowNull: false, },
        mfaVerified: { type: DataTypes.BOOLEAN, allowNull: false, }
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "User",
            required: true, childParentKey: 'userId', childModelName: "UserSession" }),
    ];

    static seedDataCore = [
        {
            sessionId: "00000000-0000-0000-0000-000000000000", // Permanent session for guest user
            userId: "00000000-0000-0000-0000-000000000000", // guest user
            srcIPAddress: "127.0.0.1", // Localhost is used for guest to prevent a very high number of sessions.
            userAgent: "Guest User Session",
            startTime: new Date(),
            expireTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100), // 100 year from now TODO: Add logic to prevent this from being expired at all
            lastUseTime: new Date(),
            status: "Active",
            mfaVerified: false
        },
                {
            sessionId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // Permanent session for guest user
            userId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // guest user
            srcIPAddress: "127.0.0.1", // Localhost is used for guest to prevent a very high number of sessions.
            userAgent: "Single User Session",
            startTime: new Date(),
            expireTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100), // 100 year from now TODO: Add logic to prevent this from being expired at all
            lastUseTime: new Date(),
            status: "Active",
            mfaVerified: false
        }
    ]

    static seedDataDemo = [
    ];
};