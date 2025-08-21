// Database seed data for Job Management System

const seedData = {
    // Job Executions


    // Job Servers
    jobServers: [
        {
            id: 'server-01-prod',
            name: 'Production Server 1',
            hostname: 'js-worker-01.company.local',
            port: 3001,
            status: 'online',
            maxConcurrentJobs: 5,
            currentJobCount: 1,
            capabilities: {
                languages: ['jsclass', 'javascript', 'sh'],
                features: ['pause', 'cancel', 'undo'],
                max_memory: '8GB',
                storage_access: ['/var/backups', '/uploads', '/temp']
            },
            lastHeartbeat: new Date('2025-08-20T14:35:00Z'),
            version: '1.2.3',
            createdAt: new Date('2025-01-10T08:00:00Z'),
            updatedAt: new Date('2025-08-20T14:35:00Z')
        },
        {
            id: 'server-02-prod',
            name: 'Production Server 2',
            hostname: 'js-worker-02.company.local',
            port: 3001,
            status: 'online',
            maxConcurrentJobs: 3,
            currentJobCount: 1,
            capabilities: {
                languages: ['jsclass', 'javascript'],
                features: ['pause', 'cancel'],
                max_memory: '4GB',
                storage_access: ['/uploads', '/temp']
            },
            lastHeartbeat: new Date('2025-08-20T14:34:45Z'),
            version: '1.2.1',
            createdAt: new Date('2025-01-12T10:30:00Z'),
            updatedAt: new Date('2025-08-20T14:34:45Z')
        },
        {
            id: 'server-03-dev',
            name: 'Development Server',
            hostname: 'js-worker-dev.company.local',
            port: 3001,
            status: 'maintenance',
            maxConcurrentJobs: 2,
            currentJobCount: 0,
            capabilities: {
                languages: ['jsclass', 'javascript', 'sh', 'powershell'],
                features: ['pause', 'cancel', 'undo'],
                max_memory: '2GB',
                storage_access: ['/dev-uploads', '/temp']
            },
            lastHeartbeat: new Date('2025-08-20T12:00:00Z'),
            version: '1.3.0-dev',
            createdAt: new Date('2025-02-15T16:00:00Z'),
            updatedAt: new Date('2025-08-20T12:00:00Z')
        }
    ],

    // Job Execution Logs
    jobExecutionLogs: [
        {
            id: 'log-001',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Database backup job started',
            data: {
                backup_path: '/var/backups/daily',
                compress: true,
                estimated_duration: '15 minutes'
            },
            timestamp: new Date('2025-08-20T02:00:10Z')
        },
        {
            id: 'log-002',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Beginning database dump',
            data: {
                databases: ['main_db', 'analytics_db', 'logs_db'],
                dump_command: 'pg_dump'
            },
            timestamp: new Date('2025-08-20T02:01:00Z')
        },
        {
            id: 'log-003',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Compressing backup files',
            data: {
                original_size: '2.3GB',
                compression_method: 'gzip',
                compression_level: 6
            },
            timestamp: new Date('2025-08-20T02:08:30Z')
        },
        {
            id: 'log-004',
            executionId: 'exec-001-backup-completed',
            level: 'warn',
            message: 'Large table detected, backup may take longer than usual',
            data: {
                table_name: 'user_activity_logs',
                table_size: '1.2GB',
                row_count: 15000000
            },
            timestamp: new Date('2025-08-20T02:05:15Z')
        },
        {
            id: 'log-005',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Starting upload to remote storage',
            data: {
                destination: 'https://backup-storage.company.com/uploads',
                file_size: '890MB',
                upload_method: 'multipart'
            },
            timestamp: new Date('2025-08-20T02:10:00Z')
        },
        {
            id: 'log-006',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Upload completed successfully',
            data: {
                upload_speed: '15MB/s',
                total_duration: '8min 32s',
                remote_file_id: 'backup_20250820_020000_abc123'
            },
            timestamp: new Date('2025-08-20T02:15:30Z')
        },
        {
            id: 'log-007',
            executionId: 'exec-001-backup-completed',
            level: 'info',
            message: 'Cleaning up local backup files older than 30 days',
            data: {
                files_deleted: 3,
                space_freed: '6.8GB'
            },
            timestamp: new Date('2025-08-20T02:15:32Z')
        },
        {
            id: 'log-008',
            executionId: 'exec-002-email-running',
            level: 'info',
            message: 'Email notification job started',
            data: {
                recipient_count: 3,
                template_id: null,
                send_immediately: true
            },
            timestamp: new Date('2025-08-20T14:30:05Z')
        },
        {
            id: 'log-009',
            executionId: 'exec-002-email-running',
            level: 'info',
            message: 'Processing recipient list',
            data: {
                recipients: ['user1@company.com', 'user2@company.com', 'user3@company.com'],
                validation_passed: 3,
                validation_failed: 0
            },
            timestamp: new Date('2025-08-20T14:30:15Z')
        },
        {
            id: 'log-010',
            executionId: 'exec-002-email-running',
            level: 'info',
            message: 'Email sent successfully',
            data: {
                recipient: 'user1@company.com',
                message_id: 'msg_001_abc123',
                delivery_time: '2.3s'
            },
            timestamp: new Date('2025-08-20T14:31:30Z')
        },
        {
            id: 'log-011',
            executionId: 'exec-002-email-running',
            level: 'info',
            message: 'Email sent successfully',
            data: {
                recipient: 'user2@company.com',
                message_id: 'msg_002_def456',
                delivery_time: '1.8s'
            },
            timestamp: new Date('2025-08-20T14:32:45Z')
        },
        {
            id: 'log-012',
            executionId: 'exec-003-import-failed',
            level: 'info',
            message: 'Data import job started',
            data: {
                file_path: '/uploads/customer_data.csv',
                target_table: 'customers',
                batch_size: 1000
            },
            timestamp: new Date('2025-08-20T11:15:05Z')
        },
        {
            id: 'log-013',
            executionId: 'exec-003-import-failed',
            level: 'info',
            message: 'File validation completed',
            data: {
                total_rows: 2500,
                columns_detected: 8,
                file_size: '450KB'
            },
            timestamp: new Date('2025-08-20T11:15:30Z')
        },
        {
            id: 'log-014',
            executionId: 'exec-003-import-failed',
            level: 'info',
            message: 'Processing batch 1 of 3',
            data: {
                batch_start: 1,
                batch_end: 1000,
                records_processed: 1000,
                validation_errors: 0
            },
            timestamp: new Date('2025-08-20T11:16:15Z')
        },
        {
            id: 'log-015',
            executionId: 'exec-003-import-failed',
            level: 'error',
            message: 'Data validation failed',
            data: {
                row_number: 1247,
                column: 'email',
                value: 'invalid-email-format',
                error: 'Invalid email format. Expected format: user@domain.com'
            },
            timestamp: new Date('2025-08-20T11:18:20Z')
        }
    ]
};

module.exports = seedData;