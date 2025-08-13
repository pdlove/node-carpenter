import { CarpenterModel, DataTypes } from "../../carpenter/CarpenterModel.js";
import CarpenterModelRelationship from "../../carpenter/CarpenterModelRelationship.js";
import bcrypt from 'bcrypt';

const saltRounds = 10;
const hashPassword = (password) => {
    return bcrypt.hashSync(password, saltRounds);
};
//export const seedOrder = ['Organization', 'User', 'SecurityGroup', 'SecurityGroupMembership', 'UserSession'];


export class Organization extends CarpenterModel {
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

// --- User Model ---
export class User extends CarpenterModel {
    static defaultReadAccess = 'site-admin';

    static sequelizeDefinition = {
        userId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false, },
        userType: { type: DataTypes.STRING, allowNull: false, }, //person, service, relay
        otpKey: { type: DataTypes.STRING, allowNull: true, },
        name: { type: DataTypes.STRING, allowNull: false, },
        title: { type: DataTypes.STRING, allowNull: true, },
        organizationId: { type: DataTypes.UUID, allowNull: false, },
        description: { type: DataTypes.STRING, allowNull: true, },
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "Organization",
            required: true, childParentKey: 'organizationId', childModelName: "User" }),
    ];

    static seedDataCore = [
        {
            userId: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e",
            email: "admin@example.com",
            password: hashPassword("password"), // Hashed password for "password"
            userType: "person",
            otpKey: null,
            name: "Initial Administrator",
            title: "System Administrator",
            organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Primary system administrator account across all teams.",
        },        
    ]

    static seedDataDemo = [
        {
            userId: "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            email: "john.doe@example.com",
            password: hashPassword("securepass123"),
            userType: "person",
            otpKey: null,
            name: "John Doe",
            title: "Web Developer",
            company: "Web Farm Solutions",
            organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Developer managing customer-facing applications.",
        },
        {
            userId: "q1w2e3r4-t5y6-7u8i-9o0p-1a2s3d4f5g6h",
            email: "jane.smith@example.com",
            password: hashPassword("anotherpass!"),
            userType: "person",
            otpKey: "KJHGFDSAQWERTYUI", // Example OTP key
            name: "Jane Smith",
            title: "IT Support",
            company: "Web Farm Solutions",
            organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Support staff with diverse team responsibilities.",
        },
    ];
};

// --- SecurityGroup Model ---
export class SecurityGroup extends CarpenterModel {
    static sequelizeDefinition = {
        securityGroupId: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        name: { type: DataTypes.STRING, allowNull: false },
        description:  { type: DataTypes.STRING, allowNull: false },
        organizationId: { type: DataTypes.UUID, allowNull: true },
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "Organization",            
            required: true, childParentKey: 'organizationId', childModelName: "SecurityGroup" }),
    ];
    static seedDataCore = [
        { securityGroupId: "d11f5a17-3b5b-4a6f-96ec-77616e730cea", name: "site-admin", description: "Administrator over entire site", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { securityGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", name: "org-admin", description: "Administrator over single organization", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { securityGroupId: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", name: "admin", description: "Generic Admin Account", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },        
        { securityGroupId: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", name: "user", description: "Able to use site", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
    ]
    static seedDataDemo = [        
        { securityGroupId: "9b2b7ff1-bbc2-4b66-a95c-939b9b3f33aa", name: "web-developer", description: "Custom Role to create and deploy websites to clusters", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
    ];
};

// --- NEW: UserTeamMembership Model ---
export class SecurityGroupUserMembership extends CarpenterModel {
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

export class SecurityGroupGroupMembership extends CarpenterModel {
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
            memberGroupId: "d11f5a17-3b5b-4a6f-96ec-77616e730cea", // site-admin group
            ofGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            addedBy: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
        },
        { //Adds the site-admin group to the org-admin.            
            membershipId: "cbe3210c-fb8a-41c7-bad6-d7589c7ac395",
            memberGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", // org-admin group
            ofGroupId: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", //  generic admin group
            addedBy: "b11e2f3d-4c5a-6b7c-8d9e-0f1a2b3c4d5e", // admin user
        },
    ]
    static seedDataDemo = [
    ];
};

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