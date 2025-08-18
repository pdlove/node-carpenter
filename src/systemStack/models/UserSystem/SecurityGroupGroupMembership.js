import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";


export default class SecurityGroupGroupMembership extends CarpenterModel {
    static sequelizeDefinition = {
        membership_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        member_group_id: { type: DataTypes.UUID, allowNull: true, },
        parent_group_id: { type: DataTypes.UUID, allowNull: false, },
        added_by:  { type: DataTypes.UUID, allowNull: true, },
    }

    static sequelizeConnections = [
        //Who created it.
        new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'user_id', relationshipNameFromParent: "addedSecurityGroupGroupMemberships",
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'added_by', relationshipNameFromChild: "added_byUser" }),            
        //The group this membership record describes
            new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "SecurityGroup", parentParentKey: 'security_group_id', relationshipNameFromParent: "GroupMemberships",  
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'member_group_id', relationshipNameFromChild: "MemberGroups" }),
        //The securitygroup of which the user is a member
        new CarpenterModelRelationship({ connectionType: "1M", required: true, 
            parentModelName: "SecurityGroup", parentParentKey: 'security_group_id', relationshipNameFromParent: "GroupHead",
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'parent_group_id', relationshipNameFromChild: "GroupHead1" }),

        //Many-to-Many relationship from a nested group directly to the security group.
        new CarpenterModelRelationship({ connectionType: "MM", required: false, 
            parentModelName: "SecurityGroup", parentKey: 'security_group_id', relationshipNameFromParent: "ChildGroups", 
            peerModelName: "SecurityGroup", peerKey: 'security_group_id', relationshipNameFromPeer: "ParentGroup",
            childModelName: "SecurityGroupGroupMembership", childParentKey: "parent_group_id", childPeerKey: "member_group_id" }),
    ];

    static seedDataCore = [
        { //Adds the site-admin group to the org-admin.            
            membership_id: "d2e3f4g5-b6c7-8d9e-0f1a-2b3c4d5e6f7g",
            member_group_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // site-admin group
            parent_group_id: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        { //Adds the org-admin group to the generic admin group.
            membership_id: "cbe3210c-fb8a-41c7-bad6-d7589c7ac395",
            member_group_id: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            parent_group_id: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", //  generic admin group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membership_id: "00000000-0000-0000-0000-000000000000",
            member_group_id: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", // user group
            parent_group_id: "00000000-0000-0000-0000-000000000000", // guest group
            added_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        }
    ]
    static seedDataDemo = [
    ];
};
