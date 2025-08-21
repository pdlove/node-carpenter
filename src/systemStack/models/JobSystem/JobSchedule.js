import {CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobSchedule extends CarpenterModel {
    static sequelizeDefinition = {
    job_schedule_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    job_template_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, comment: 'User-defined name for this schedule' },
    description: { type: DataTypes.TEXT, allowNull: true },
    configuration: { type: DataTypes.JSON, allowNull: true, comment: 'Job-specific configuration parameters' },
    // Scheduling options
    schedule_type: { type: DataTypes.ENUM('immediate', 'delayed', 'recurring', 'cron'), allowNull: false, defaultValue: 'immediate' },
    start_time: { type: DataTypes.DATE, allowNull: true, comment: 'When to start (for delayed/recurring)' },
    interval: { type: DataTypes.INTEGER, allowNull: true, comment: 'Interval for recurring jobs' },
    interval_units: { type: DataTypes.ENUM('s', 'm', 'h', 'd'), allowNull: true },
    cron_expression: { type: DataTypes.STRING, allowNull: true, comment: 'Cron expression for complex scheduling' },
    run_count: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'How many times to run (0 = infinite for recurring)' },
    times_executed: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'How many times this schedule has been executed' },
    priority: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Higher numbers = higher priority' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true, comment: 'Whether this schedule is active' },
    last_executed: { type: DataTypes.DATE, allowNull: true },
    next_execution: { type: DataTypes.DATE, allowNull: true, comment: 'When this schedule should next create an execution' },
    created_by: { type: DataTypes.UUID, allowNull: false, comment: 'User who created this schedule' }
}

    static sequelizeConnections = [
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "JobTemplate",
            required: true, childParentKey: 'job_template_id', childModelName: "JobSchedule"
        }),
        new CarpenterModelRelationship({
            connectionType: "1M",
            parentModelName: "User",
            required: true, childParentKey: 'created_by', childModelName: "JobSchedule"
        }),
    ];
    static seedDataCore = [];
    static seedDataDemo = [
        {
            job_schedule_id: 'afa7e9bb-c5ef-49f4-bbef-b68c1c8b4d3a',
            job_template_id: 'bdb4d4e7-ef40-455b-b0a5-e4eb368578db',
            name: 'Daily Database Backup',
            description: 'Automated daily backup at 2 AM with 30-day retention',
            configuration: {
                backup_path: '/var/backups/daily',
                compress: true,
                remote_storage_url: 'https://backup-storage.company.com/uploads',
                retention_days: 30
            },
            schedule_type: 'recurring',
            start_time: new Date('2025-08-21T02:00:00Z'),
            interval: 24,
            interval_units: 'h',
            cron_expression: null,
            run_count: 0, // infinite
            times_executed: 156,
            priority: 10,
            is_active: true,
            last_executed: new Date('2025-08-20T02:00:00Z'),
            next_execution: new Date('2025-08-21T02:00:00Z'),
            created_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            created_at: new Date('2025-01-15T10:30:00Z'),
            updated_at: new Date('2025-08-20T02:00:00Z')
        },
        {
            job_schedule_id: 'sch-002-weekly-report',
            job_template_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'Weekly Status Report',
            description: 'Send weekly status reports to management team every Monday at 9 AM',
            configuration: {
                recipients: 'management@company.com,operations@company.com',
                subject: 'Weekly System Status Report - {{date}}',
                message_body: 'Please find the attached weekly system status report.',
                template_id: 'weekly-report-template',
                send_immediately: true
            },
            schedule_type: 'cron',
            start_time: null,
            interval: null,
            interval_units: null,
            cron_expression: '0 9 * * 1', // Every Monday at 9 AM
            run_count: 0,
            times_executed: 23,
            priority: 5,
            is_active: true,
            last_executed: new Date('2025-08-19T09:00:00Z'),
            next_execution: new Date('2025-08-26T09:00:00Z'),
            created_by: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            created_at: new Date('2025-02-01T12:00:00Z'),
            updated_at: new Date('2025-08-19T09:00:00Z')
        }
    ];
};