import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class SecurityGroupUserMembership extends CarpenterModel {
    static sequelizeDefinition = {
        membership_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        member_user_id: { type: DataTypes.UUID, allowNull: true, },
        parent_group_id: { type: DataTypes.UUID, allowNull: false, },
        added_by:  { type: DataTypes.UUID, allowNull: true, },
    }

    static sequelizeConnections = [
        //Who created it.
        new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'user_id', relationshipNameFromParent: "addedSecurityGroupUserMemberships",
            childModelName: "SecurityGroupUserMembership", childParentKey: 'added_by', relationshipNameFromChild: "added_byUser" }),            
        //The user this membership record describes
            new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'user_id', 
            childModelName: "SecurityGroupUserMembership", childParentKey: 'member_user_id' }),
        //The securitygroup of which the user is a member
        new CarpenterModelRelationship({ connectionType: "1M", required: true, 
            parentModelName: "SecurityGroup", parentParentKey: 'security_group_id', 
            childModelName: "SecurityGroupUserMembership", childParentKey: 'parent_group_id' }),

        //Many-to-Many relationship from User directly to the security group.            
        new CarpenterModelRelationship({ connectionType: "MM", required: false, 
            parentModelName: "User", relationshipNameFromParent: "Groups", 
            peerModelName: "SecurityGroup", relationshipNameFromPeer: "Users",
            childModelName: "SecurityGroupUserMembership", childParentKey: "member_user_id", childPeerKey: "parent_group_id" }),
    ];

    static seedDataCore = [
        {
            membership_id: "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
            member_user_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
            parent_group_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // site-admin group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membership_id: "136dff29-4c09-4bfa-a339-8fa2836a6eaf",
            member_user_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
            parent_group_id: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", // user group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membership_id: "00000000-0000-0000-0000-000000000000",
            member_user_id: "00000000-0000-0000-0000-000000000000", // guest user
            parent_group_id: "00000000-0000-0000-0000-000000000000", // guest group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        }
    ]
    static seedDataDemo = [
    ];
};
