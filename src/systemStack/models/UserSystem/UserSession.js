import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class UserSession extends CarpenterModel {
    static sequelizeDefinition = {
        session_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        user_id: { type: DataTypes.UUID, allowNull: false, },
        src_ipaddress: { type: DataTypes.STRING, allowNull: false, },
        user_agent: { type: DataTypes.STRING, allowNull: false, },
        start_time: { type: DataTypes.DATE, allowNull: false, },
        expire_time: { type: DataTypes.DATE, allowNull: false, },        
        last_use_time: { type: DataTypes.DATE, allowNull: true, },
        status: { type: DataTypes.ENUM('Active', 'InActive', 'Logout', 'Expired', 'Terminated'), allowNull: false, },
        mfa_verified: { type: DataTypes.BOOLEAN, allowNull: false, }
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "User",
            required: true, childParentKey: 'user_id', childModelName: "UserSession" }),
    ];

    static seedDataCore = [
        {
            session_id: "00000000-0000-0000-0000-000000000000", // Permanent session for guest user
            user_id: "00000000-0000-0000-0000-000000000000", // guest user
            src_ipaddress: "127.0.0.1", // Localhost is used for guest to prevent a very high number of sessions.
            user_agent: "Guest User Session",
            start_time: new Date(),
            expire_time: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100), // 100 year from now TODO: Add logic to prevent this from being expired at all
            last_use_time: new Date(),
            status: "Active",
            mfa_verified: false
        },
                {
            session_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // Permanent session for guest user
            user_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // guest user
            src_ipaddress: "127.0.0.1", // Localhost is used for guest to prevent a very high number of sessions.
            user_agent: "Single User Session",
            start_time: new Date(),
            expire_time: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100), // 100 year from now TODO: Add logic to prevent this from being expired at all
            last_use_time: new Date(),
            status: "Active",
            mfa_verified: false
        }
    ]

    static seedDataDemo = [
    ];
};