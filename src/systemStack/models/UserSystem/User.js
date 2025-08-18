import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";
import bcrypt from 'bcrypt';

//This is used to hash passwords during the seeding process. Inserting during normal operations should be done in the Password Change functions.
const saltRounds = 10;
const hashPassword = (password) => {
    return bcrypt.hashSync(password, saltRounds);
};
export default class User extends CarpenterModel {
    static defaultReadAccess = 'site-admin';

    static sequelizeDefinition = {
        user_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false, },
        user_type: { type: DataTypes.STRING, allowNull: false, }, //person, service, relay
        otp_key: { type: DataTypes.STRING, allowNull: true, },
        name: { type: DataTypes.STRING, allowNull: false, },
        title: { type: DataTypes.STRING, allowNull: true, },
        organization_id: { type: DataTypes.UUID, allowNull: false, },
        description: { type: DataTypes.STRING, allowNull: true, },
    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M",
            parentModelName: "Organization",
            required: true, childParentKey: 'organization_id', childModelName: "User" }),
    ];

    static seedDataCore = [
        {
            user_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            email: "admin@example.com",
            password: hashPassword("password"), // Hashed password for "password"
            user_type: "person",
            otp_key: null,
            name: "Initial Administrator",
            title: "System Administrator",
            organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Primary system administrator account across all teams.",
        },            {
            user_id: "00000000-0000-0000-0000-000000000000",
            email: "guest@example.com",
            password: hashPassword("password"), // Hashed password for "password"
            user_type: "person",
            otp_key: null,
            name: "Guest User",
            organization_id: "00000000-0000-0000-0000-000000000000",
            description: "Guest account for public access.",
        },        
    ]

    static seedDataDemo = [
        {
            user_id: "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            email: "john.doe@example.com",
            password: hashPassword("securepass123"),
            user_type: "person",
            otp_key: null,
            name: "John Doe",
            title: "Web Developer",
            company: "Web Farm Solutions",
            organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Developer managing customer-facing applications.",
        },
        {
            user_id: "q1w2e3r4-t5y6-7u8i-9o0p-1a2s3d4f5g6h",
            email: "jane.smith@example.com",
            password: hashPassword("anotherpass!"),
            user_type: "person",
            otp_key: "KJHGFDSAQWERTYUI", // Example OTP key
            name: "Jane Smith",
            title: "IT Support",
            company: "Web Farm Solutions",
            organization_id: "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            description: "Support staff with diverse team responsibilities.",
        },
    ];
};
