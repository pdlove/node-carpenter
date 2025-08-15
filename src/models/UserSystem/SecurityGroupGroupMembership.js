import CarpenterModel from "../../lib/CarpenterModel.js";
import CarpenterModelRelationship from "../../lib/CarpenterModelRelationship.js";
import { DataTypes } from "sequelize";

export default class SecurityGroupGroupMembership extends CarpenterModel {
    static sequelizeDefinition = {
        membershipId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        memberGroupId: { type: DataTypes.UUID, allowNull: true, },
        ofGroupId: { type: DataTypes.UUID, allowNull: false, },
        addedBy:  { type: DataTypes.UUID, allowNull: true, },
    }

    static sequelizeConnections = [
        //Who created it.
        new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "User", parentParentKey: 'userId', relationshipNameFromParent: "addedSecurityGroupGroupMemberships",
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'addedBy', relationshipNameFromChild: "addedByUser" }),            
        //The group this membership record describes
            new CarpenterModelRelationship({ connectionType: "1M", required: true,
            parentModelName: "SecurityGroup", parentParentKey: 'securityGroupId', relationshipNameFromParent: "GroupMemberships",  
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'memberGroupId', relationshipNameFromChild: "MemberGroups" }),
        //The securitygroup of which the user is a member
        new CarpenterModelRelationship({ connectionType: "1M", required: true, 
            parentModelName: "SecurityGroup", parentParentKey: 'securityGroupId', relationshipNameFromParent: "GroupHead",
            childModelName: "SecurityGroupGroupMembership", childParentKey: 'ofGroupId', relationshipNameFromChild: "GroupHead1" }),

        //Many-to-Many relationship from a nested group directly to the security group.
        new CarpenterModelRelationship({ connectionType: "MM", required: false, 
            parentModelName: "SecurityGroup", parentKey: 'securityGroupId', relationshipNameFromParent: "ChildGroups", 
            peerModelName: "SecurityGroup", peerKey: 'securityGroupId', relationshipNameFromPeer: "ParentGroup",
            childModelName: "SecurityGroupGroupMembership", childParentKey: "ofGroupId", childPeerKey: "memberGroupId" }),
    ];

    static seedDataCore = [
        { //Adds the site-admin group to the org-admin.            
            membershipId: "d2e3f4g5-b6c7-8d9e-0f1a-2b3c4d5e6f7g",
            memberGroupId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // site-admin group
            ofGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        { //Adds the org-admin group to the generic admin group.
            membershipId: "cbe3210c-fb8a-41c7-bad6-d7589c7ac395",
            memberGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            ofGroupId: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", //  generic admin group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        },
        {
            membershipId: "00000000-0000-0000-0000-000000000000",
            memberGroupId: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", // user group
            ofGroupId: "00000000-0000-0000-0000-000000000000", // guest group
            addedBy: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // admin user
        }
    ]
    static seedDataDemo = [
    ];
};
