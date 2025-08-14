import CarpenterModel from "../../lib/CarpenterModel.js";
import CarpenterModelRelationship from "../../lib/CarpenterModelRelationship.js";
import { DataTypes } from "sequelize";

export default class SecurityGroupUserMembership extends CarpenterModel {
    static sequelizeDefinition = {
        membershipId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        memberUserId: { type: DataTypes.UUID, allowNull: true, },
        ofGroupId: { type: DataTypes.UUID, allowNull: false, },
        addedBy:  { type: DataTypes.UUID, allowNull: true, },
    }

    static sequelizeConnections = [
        //Who created it.
        new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'userId', relationshipNameFromParent: "addedSecurityGroupUserMemberships",
            childModelName: "SecurityGroupUserMembership", childParentKey: 'addedBy', relationshipNameFromChild: "addedByUser" }),            
        //The user this membership record describes
            new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'userId', 
            childModelName: "SecurityGroupUserMembership", childParentKey: 'memberUserId' }),
        //The securitygroup of which the user is a member
        new CarpenterModelRelationship({ connectionType: "1M", required: true, 
            parentModelName: "SecurityGroup", parentParentKey: 'securityGroupId', 
            childModelName: "SecurityGroupUserMembership", childParentKey: 'ofGroupId' }),

        //Many-to-Many relationship from User directly to the security group.            
        new CarpenterModelRelationship({ connectionType: "MM", required: false, 
            parentModelName: "User", relationshipNameFromParent: "Groups", 
            peerModelName: "SecurityGroup", relationshipNameFromPeer: "Users",
            childModelName: "SecurityGroupUserMembership", childParentKey: "memberUserId", childPeerKey: "ofGroupId" }),
    ];

    static seedDataCore = [
        {
            membershipId: "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
            memberUserId: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
            ofGroupId: "d11f5a17-3b5b-4a6f-96ec-77616e730cea", // site-admin group
            addedBy: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
        },
        {
            membershipId: "136dff29-4c09-4bfa-a339-8fa2836a6eaf",
            memberUserId: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
            ofGroupId: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", // user group
            addedBy: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
        }
    ]
    static seedDataDemo = [
    ];
};
