import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";


export default class SecurityGroup extends CarpenterModel {
    static sequelizeDefinition = {
        security_group_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        name: { type: DataTypes.STRING, allowNull: false },
        description:  { type: DataTypes.STRING, allowNull: false },
        organization_id: { type: DataTypes.UUID, allowNull: true },
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "Organization",            
            required: true, childParentKey: 'organization_id', childModelName: "SecurityGroup" }),
    ];
    static seedDataCore = [
        { security_group_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", name: "site-admin", description: "Administrator over entire site", organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { security_group_id: "6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p", name: "org-admin", description: "Administrator over single organization", organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { security_group_id: "95f0b8a2-1c25-4a5d-a23f-4896106c93df", name: "admin", description: "Generic Admin Account", organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },        
        { security_group_id: "65d6f7e0-cb3e-4eb1-b58b-3dd9d404f37d", name: "user", description: "Able to use site", organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
        { security_group_id: "00000000-0000-0000-0000-000000000000", name: "guest", description: "Guest User", organization_id: "00000000-0000-0000-0000-000000000000" },
    ]
    static seedDataDemo = [        
        { security_group_id: "9b2b7ff1-bbc2-4b66-a95c-939b9b3f33aa", name: "web-developer", description: "Custom Role to create and deploy websites to clusters", organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de" },
    ];
};
