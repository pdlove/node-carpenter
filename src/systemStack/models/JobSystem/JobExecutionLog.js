import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobExecutionLog extends CarpenterModel {
    static sequelizeDefinition = {
        log_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        execution_id: { type: DataTypes.UUID, allowNull: false },
        level: { type: DataTypes.ENUM("info", "warn", "error", "debug"), allowNull: false, defaultValue: "info" },
        message: { type: DataTypes.TEXT, allowNull: false },
        data: { type: DataTypes.JSON, comment: "Additional structured data" },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
    };

    static sequelizeConnections = [
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "JobExecution",
            required: true, childParentKey: 'execution_id', childModelName: "JobExecutionLog"
        }),

    ];
    static seedDataCore = [];
    static seedDataDemo = [
        {
            log_id: "8cfe67f0-5698-4d59-bbfb-7990fe93aa81",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Database backup job started",
            data: {
                backup_path: "/var/backups/daily",
                compress: true,
                estimated_duration: "15 minutes"
            },
            timestamp: new Date("2025-08-20T02:00:10Z")
        },
        {
            log_id: "6ccbb773-01cc-4f77-bc87-4ae3cf9bd14c",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Beginning database dump",
            data: {
                databases: ["main_db", "analytics_db", "logs_db"],
                dump_command: "pg_dump"
            },
            timestamp: new Date("2025-08-20T02:01:00Z")
        },
        {
            log_id: "74c7c088-f8ba-4d61-b439-52e999936d4b",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Compressing backup files",
            data: {
                original_size: "2.3GB",
                compression_method: "gzip",
                compression_level: 6
            },
            timestamp: new Date("2025-08-20T02:08:30Z")
        },
        {
            log_id: "25f10c88-c074-4493-b1d5-20b7c6203e09",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "warn",
            message: "Large table detected, backup may take longer than usual",
            data: {
                table_name: "user_activity_logs",
                table_size: "1.2GB",
                row_count: 15000000
            },
            timestamp: new Date("2025-08-20T02:05:15Z")
        },
        {
            log_id: "a480e5cb-e470-434a-870d-27c636b06a8b",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Starting upload to remote storage",
            data: {
                destination: "https://backup-storage.company.com/uploads",
                file_size: "890MB",
                upload_method: "multipart"
            },
            timestamp: new Date("2025-08-20T02:10:00Z")
        },
        {
            log_id: "b2b1b241-8327-430a-86a2-2a02dfbcde98",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Upload completed successfully",
            data: {
                upload_speed: "15MB/s",
                total_duration: "8min 32s",
                remote_file_id: "backup_20250820_020000_abc123"
            },
            timestamp: new Date("2025-08-20T02:15:30Z")
        },
        {
            log_id: "cdf35547-68a4-44bf-bac6-6d3b18280557",
            execution_id: "56653e54-7fbe-4142-9a71-fec97588d689",
            level: "info",
            message: "Cleaning up local backup files older than 30 days",
            data: {
                files_deleted: 3,
                space_freed: "6.8GB"
            },
            timestamp: new Date("2025-08-20T02:15:32Z")
        },
        {
            log_id: "ef65eaa6-1b7b-44d1-8fe5-bbaf41bea336",
            execution_id: "919c386a-a830-45ce-8692-f5582f8538ef",
            level: "info",
            message: "Email notification job started",
            data: {
                recipient_count: 3,
                template_id: null,
                send_immediately: true
            },
            timestamp: new Date("2025-08-20T14:30:05Z")
        },
        {
            log_id: "18fb69b2-579c-42c7-a2a0-03337127badf",
            execution_id: "919c386a-a830-45ce-8692-f5582f8538ef",
            level: "info",
            message: "Processing recipient list",
            data: {
                recipients: ["user1@company.com", "user2@company.com", "user3@company.com"],
                validation_passed: 3,
                validation_failed: 0
            },
            timestamp: new Date("2025-08-20T14:30:15Z")
        },
        {
            log_id: "a1dbca79-389d-4bca-9231-b88ba68810e5",
            execution_id: "919c386a-a830-45ce-8692-f5582f8538ef",
            level: "info",
            message: "Email sent successfully",
            data: {
                recipient: "user1@company.com",
                message_id: "msg_001_abc123",
                delivery_time: "2.3s"
            },
            timestamp: new Date("2025-08-20T14:31:30Z")
        },
        {
            log_id: "c5915d76-3c08-47f6-8c97-8f94c05273ee",
            execution_id: "919c386a-a830-45ce-8692-f5582f8538ef",
            level: "info",
            message: "Email sent successfully",
            data: {
                recipient: "user2@company.com",
                message_id: "msg_002_def456",
                delivery_time: "1.8s"
            },
            timestamp: new Date("2025-08-20T14:32:45Z")
        },
        {
            log_id: "6e948c09-54ee-43b8-8b4d-17afb9505376",
            execution_id: "70126829-2f23-4a58-b547-0391f6ad7605",
            level: "info",
            message: "Data import job started",
            data: {
                file_path: "/uploads/customer_data.csv",
                target_table: "customers",
                batch_size: 1000
            },
            timestamp: new Date("2025-08-20T11:15:05Z")
        },
        {
            log_id: "804725cc-c81b-4285-9a10-3ae0fe2d05a3",
            execution_id: "70126829-2f23-4a58-b547-0391f6ad7605",
            level: "info",
            message: "File validation completed",
            data: {
                total_rows: 2500,
                columns_detected: 8,
                file_size: "450KB"
            },
            timestamp: new Date("2025-08-20T11:15:30Z")
        },
        {
            log_id: "37c3b030-8881-403e-9c2b-f88c0d19f38a",
            execution_id: "70126829-2f23-4a58-b547-0391f6ad7605",
            level: "info",
            message: "Processing batch 1 of 3",
            data: {
                batch_start: 1,
                batch_end: 1000,
                records_processed: 1000,
                validation_errors: 0
            },
            timestamp: new Date("2025-08-20T11:16:15Z")
        },
        {
            log_id: "845359bb-18df-4641-9468-8fb68a877ae6",
            execution_id: "70126829-2f23-4a58-b547-0391f6ad7605",
            level: "error",
            message: "Data validation failed",
            data: {
                row_number: 1247,
                column: "email",
                value: "invalid-email-format",
                error: "Invalid email format. Expected format: user@domain.com"
            },
            timestamp: new Date("2025-08-20T11:18:20Z")
        }
    ];
}
