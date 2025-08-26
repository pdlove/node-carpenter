import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class Location extends CarpenterModel {
    
    static sequelizeDefinition = {
        location_id: { type: DataTypes.UUID, primaryKey: true },
        organization_id: { type: DataTypes.UUID, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        location_type: { type: DataTypes.STRING, allowNull: true }, // e.g., "office", "warehouse", etc.
        description: { type: DataTypes.STRING, allowNull: true },
        parent_location_id: { type: DataTypes.UUID, allowNull: true }, // For hierarchical locations
        owner_user_id: { type: DataTypes.UUID, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: true },
        latitude: { type: DataTypes.FLOAT, allowNull: true },
        longitude: { type: DataTypes.FLOAT, allowNull: true },
        technical_person: { type: DataTypes.UUID, allowNull: true },
        billing_contact_person: { type: DataTypes.UUID, allowNull: true },
        scheduling_contact_person: { type: DataTypes.UUID, allowNull: true },        
    };

    static sequelizeConnections = [
        new CarpenterModelRelationship({ connectionType: "1M", 
            parentModelName: "Organization",
            required: true, childParentKey: 'organization_id', childModelName: "Location" }),
        new CarpenterModelRelationship({ connectionType: "1M", 
            parentModelName: "User",
            required: true, childParentKey: 'owner_user_id', childModelName: "Location" }),
        //TODO: Add relationships for technical_person, billing_contact_person, and scheduling_contact_person
        //TODO: Add hierarchical relationship for parent_location_id
    ];

    static seedDataCore = [{
            "location_id": "795c6298-7bf6-47c7-9a16-c99439f9993c",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Default",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        }]
    static seedDataDemo = [
        {
            "location_id": "88767b74-cce7-4ba2-b86c-c3fc7d67bcd9",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Site 2",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "60975 Jessica Squares, Little Rock, AR 73121",
            "latitude": "36.438327",
            "longitude": "-90.747224",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "84f6a870-d019-4ee4-a3fb-397b52b2211d",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Site 2 - MDF",
            "parent_location_id": "88767b74-cce7-4ba2-b86c-c3fc7d67bcd9",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "60975 Jessica Squares, Little Rock, AR 73121",
            "latitude": "36.438327",
            "longitude": "-90.747224",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "915b2e80-5138-4962-9aef-045d4ffe9202",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Site 3",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "93328 Davis Island, Memphis, TN 38971",
            "latitude": "46.794709",
            "longitude": "-95.232849",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "e30f267d-b554-4914-a9b0-03e5689774af",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Site 4",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "48418 Olsen Plains Apt. 989, St. Louis, MO 63801",
            "latitude": "31.764108",
            "longitude": "-80.91916",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "9f37eac1-e839-450e-9fba-a198a7a4a7eb",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Corporate",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "12201 Massey Pine Suite 833, Texarkana, TX 75984",
            "latitude": "46.83391",
            "longitude": "-67.981228",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "16b5fd32-7139-496b-ae29-ec3613647559",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Corporate",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "1965 Kelly Field Apt. 094, Texarkana, TX 75839",
            "latitude": "39.840856",
            "longitude": "-109.721139",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "31d55320-d0de-42bf-9cb5-c2a7549a16de",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Sales Pit",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "8379 Randall Estates Suite 120, Oklahoma City, OK, 73120",
            "latitude": "35.46756",
            "longitude": "-97.516428",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "260a23ee-a787-4001-a4de-79a601bbe451",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "San Diego",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "0487 Hull Village Suite 759, San Diego, CA 92418",
            "latitude": "45.266124",
            "longitude": "-80.796599",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "c48b4177-92bc-40dd-85f0-535485f63f63",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Houston",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "242 Christine Glen, Houston, TX 77102",
            "latitude": "35.093718",
            "longitude": "-109.241745",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "3fd7d3a5-c07d-4180-a31e-f860c194348a",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "New York",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "1157 Michael Island, New York, NY 10748",
            "latitude": "37.270593",
            "longitude": "-100.918754",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        },
        {
            "location_id": "18035ab3-ea54-47d4-aa20-2eb98bfef3e8",
            "organization_id": "94a72a62-3d66-4e78-a20a-14f4eae1a9de",
            "name": "Miami",
            "owner_user_id": "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "address": "778 Brown Plaza, Miami, FL 33176",
            "latitude": "43.811166",
            "longitude": "-106.711175",
            "technical_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "billing_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p",
            "scheduling_contact_person": "a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p"
        }
    ];
}
