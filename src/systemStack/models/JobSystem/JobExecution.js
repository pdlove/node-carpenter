import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobExecution extends CarpenterModel {
    static sequelizeDefinition = {
        execution_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        template_id: { type: DataTypes.UUID, allowNull: false },
        schedule_id: { type: DataTypes.UUID, allowNull: true, comment: 'Null for ad-hoc executions' },
        worker_id: { type: DataTypes.UUID, allowNull: true, comment: 'ID of server that claimed this execution' },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'claimed',
                'running',
                'paused',
                'completed',
                'failed',
                'cancelled',
                'timeout',
                'orphaned'
            ),
            defaultValue: 'pending',
            allowNull: false
        },
        configuration: { type: DataTypes.JSON, allowNull: true, comment: 'Runtime configuration for this execution' },
        priority: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Execution priority (higher = more important)' },
        start_time: { type: DataTypes.DATE, allowNull: true, comment: 'When execution actually started' },
        end_time: { type: DataTypes.DATE, allowNull: true, comment: 'When execution finished' },
        last_heartbeat: { type: DataTypes.DATE, allowNull: true, comment: 'Last status update from executing server' },
        claimed_at: { type: DataTypes.DATE, allowNull: true, comment: 'When this execution was claimed by a server' },
        result: { type: DataTypes.JSON, allowNull: true, comment: 'Execution result data' },
        error_message: { type: DataTypes.TEXT, allowNull: true, comment: 'Error details if execution failed' },
        logs: { type: DataTypes.TEXT, allowNull: true, comment: 'Execution logs' },
        progress: { type: DataTypes.FLOAT, defaultValue: 0, comment: 'Progress percentage (0-100)' },
        progress_message: { type: DataTypes.STRING, allowNull: true, comment: 'Current progress description' },
        execution_attempt: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'Which attempt this is (for retries)' },
        max_attempts: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'Maximum retry attempts' },
        created_by: { type: DataTypes.STRING, allowNull: true, comment: 'User who created this execution (null for system-created)' }

    }

    static sequelizeConnections = [
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "JobTemplate",
            required: true, childParentKey: 'template_id', childModelName: "JobExecution"
        }),
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "JobSchedule",
            required: true, childParentKey: 'schedule_id', childModelName: "JobExecution"
        }),
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "CarpenterWorker",
            required: false, childParentKey: 'worker_id', childModelName: "JobExecution"
        }),
    ];
    static seedDataCore = [];
    static seedDataDemo = [
            {
                execution_id: '56653e54-7fbe-4142-9a71-fec97588d689',
                template_id: 'bdb4d4e7-ef40-455b-b0a5-e4eb368578db',
                schedule_id: 'afa7e9bb-c5ef-49f4-bbef-b68c1c8b4d3a',
                worker_id: "00000000-0000-0000-0000-000000000000",
                status: 'completed',
                configuration: {
                    backup_path: '/var/backups/daily',
                    compress: true,
                    remote_storage_url: 'https://backup-storage.company.com/uploads',
                    retention_days: 30
                },
                priority: 10,
                start_time: new Date('2025-08-20T02:00:00Z'),
                end_time: new Date('2025-08-20T02:15:32Z'),
                last_heartbeat: new Date('2025-08-20T02:15:32Z'),
                claimed_at: new Date('2025-08-20T02:00:05Z'),
                result: {
                    files_backed_up: 1247,
                    total_size: '2.3GB',
                    compressed_size: '890MB',
                    compression_ratio: '61%',
                    upload_duration: '8min 32s',
                    backup_file: 'backup_2025-08-20_02-00-00.tar.gz'
                },
                error_message: null,
                logs: 'Database backup started\nCompressing files...\nUploading to remote storage\nBackup completed successfully',
                progress: 100,
                progress_message: 'Backup completed successfully',
                execution_attempt: 1,
                max_attempts: 3,
                created_by: null,
                created_at: new Date('2025-08-20T01:59:58Z'),
                updated_at: new Date('2025-08-20T02:15:32Z')
            },
            {
                execution_id: '919c386a-a830-45ce-8692-f5582f8538ef',
                template_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                schedule_id: null,
                worker_id: "00000000-0000-0000-0000-000000000000",
                status: 'running',
                configuration: {
                    recipients: 'user1@company.com,user2@company.com,user3@company.com',
                    subject: 'System Maintenance Notification',
                    message_body: 'We will be performing scheduled maintenance tonight from 2-4 AM EST.',
                    template_id: null,
                    send_immediately: true
                },
                priority: 5,
                start_time: new Date('2025-08-20T14:30:00Z'),
                end_time: null,
                last_heartbeat: new Date('2025-08-20T14:33:15Z'),
                claimed_at: new Date('2025-08-20T14:30:02Z'),
                result: null,
                error_message: null,
                logs: 'Email job started\nProcessing recipient list (3 contacts)\nSending emails...',
                progress: 67,
                progress_message: 'Sending emails (2 of 3 sent)',
                execution_attempt: 1,
                max_attempts: 2,
                created_by: 'john.doe',
                created_at: new Date('2025-08-20T14:29:45Z'),
                updated_at: new Date('2025-08-20T14:33:15Z')
            },
            {
                execution_id: '70126829-2f23-4a58-b547-0391f6ad7605',
                template_id: 'f1e2d3c4-b5a6-9876-5432-1098765432ab',
                schedule_id: null,
                worker_id: "00000000-0000-0000-0000-000000000000",
                status: 'failed',
                configuration: {
                    file_path: '/uploads/customer_data.csv',
                    table_name: 'customers',
                    validate_data: true,
                    batch_size: 1000,
                    skip_duplicates: false
                },
                priority: 0,
                start_time: new Date('2025-08-20T11:15:00Z'),
                end_time: new Date('2025-08-20T11:18:23Z'),
                last_heartbeat: new Date('2025-08-20T11:18:23Z'),
                claimed_at: new Date('2025-08-20T11:15:03Z'),
                result: null,
                error_message: 'Data validation failed: Invalid email format in row 1247. Expected format: user@domain.com',
                logs: 'Data import started\nValidating file format\nProcessing 2500 records\nValidation error encountered',
                progress: 49,
                progress_message: 'Validation failed at row 1247',
                execution_attempt: 2,
                max_attempts: 3,
                created_by: 'data.admin',
                created_at: new Date('2025-08-20T11:14:30Z'),
                updated_at: new Date('2025-08-20T11:18:23Z')
            }
    ];
};
