import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

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
            memberUserId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
            ofGroupId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // site-admin group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membershipId: "136dff29-4c09-4bfa-a339-8fa2836a6eaf",
            memberUserId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
            ofGroupId: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", // user group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membershipId: "00000000-0000-0000-0000-000000000000",
            memberUserId: "00000000-0000-0000-0000-000000000000", // guest user
            ofGroupId: "00000000-0000-0000-0000-000000000000", // guest group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        }
    ]
    static seedDataDemo = [
    ];
};
