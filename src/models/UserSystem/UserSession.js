import { CarpenterModel, DataTypes } from "../../carpenter/CarpenterModel.js";
import CarpenterModelRelationship from "../../carpenter/CarpenterModelRelationship.js";

export class UserSession extends CarpenterModel {
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
    ]

    static seedDataDemo = [
    ];
};