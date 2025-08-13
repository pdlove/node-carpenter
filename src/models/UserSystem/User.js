import { CarpenterModel, DataTypes } from "../../carpenter/CarpenterModel.js";
import CarpenterModelRelationship from "../../carpenter/CarpenterModelRelationship.js";
import bcrypt from 'bcrypt';

//This is used to hash passwords during the seeding process. Inserting during normal operations should be done in the Password Change functions.
const saltRounds = 10;
const hashPassword = (password) => {
    return bcrypt.hashSync(password, saltRounds);
};
export default class User extends CarpenterModel {
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
