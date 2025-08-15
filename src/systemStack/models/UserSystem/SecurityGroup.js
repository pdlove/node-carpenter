import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";


export default class SecurityGroup extends CarpenterModel {
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
        { securityGroupId: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", name: "site-admin", description: "Administrator over entire site", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { securityGroupId: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", name: "org-admin", description: "Administrator over single organization", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { securityGroupId: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", name: "admin", description: "Generic Admin Account", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },        
        { securityGroupId: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", name: "user", description: "Able to use site", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { securityGroupId: "00000000-0000-0000-0000-000000000000", name: "guest", description: "Guest User", organizationId: "00000000-0000-0000-0000-000000000000" },
    ]
    static seedDataDemo = [        
        { securityGroupId: "9b2b7ff1-bbc2-4b66-a95c-939b9b3f33aa", name: "web-developer", description: "Custom Role to create and deploy websites to clusters", organizationId: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
    ];
};
