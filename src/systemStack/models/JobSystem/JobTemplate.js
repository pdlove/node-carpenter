import { CarpenterModel, CarpenterModelRelationship, DataTypes } from "../../../index.js";

export default class JobTemplate extends CarpenterModel {
    static sequelizeDefinition = {
        job_template_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false, comment: 'Display name of the job template' },
        class_name: { type: DataTypes.STRING, allowNull: false, unique: true, comment: 'JavaScript class name for this template' },
        description: { type: DataTypes.TEXT, allowNull: true, comment: 'User-friendly description' },
        start_type: { type: DataTypes.ENUM('service', 'scheduled', 'adhoc-system', 'adhoc-user'), allowNull: false, comment: 'How this job can be started' },
        job_language: { type: DataTypes.ENUM('jsclass', 'javascript', 'powershell', 'sh'), defaultValue: 'jsclass', allowNull: false },
        job_command: { type: DataTypes.TEXT, allowNull: true, comment: 'Command text for non-jsclass jobs' },
        configuration_schema: { type: DataTypes.JSON, allowNull: true, comment: 'JSON schema defining expected configuration parameters' },
        default_interval: { type: DataTypes.INTEGER, defaultValue: 0 },
        default_interval_units: { type: DataTypes.ENUM('s', 'm', 'h', 'd', 'w'), defaultValue: 's' },
        default_run_count: { type: DataTypes.INTEGER, defaultValue: 1 },
        run_access: { type: DataTypes.STRING, defaultValue: 'admin', comment: 'Security group that can run this job' },
        schedule_access: { type: DataTypes.STRING, defaultValue: 'admin', comment: 'Security group that can create schedules' },
        config_access: { type: DataTypes.STRING, defaultValue: 'admin', comment: 'Security group that can modify configurations' },
        is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
        supports_pause: { type: DataTypes.BOOLEAN, defaultValue: false },
        supports_cancel: { type: DataTypes.BOOLEAN, defaultValue: false },
        supports_undo: { type: DataTypes.BOOLEAN, defaultValue: false }
    }

    static sequelizeConnections = [];
    static seedDataCore = [];
    static seedDataDemo = [{
        job_template_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Email Notification Service',
        class_name: 'EmailNotificationJob',
        description: 'Send bulk email notifications with template support and delivery tracking',
        start_type: 'adhoc-user',
        job_language: 'jsclass',
        job_command: null,
        configuration_schema: {
            recipients: {
                type: 'TEXT',
                allowNull: false,
                display: 'Recipients',
                description: 'Comma-separated list of email addresses or user group names'
            },
            subject: {
                type: 'STRING',
                allowNull: false,
                display: 'Email Subject',
                description: 'Subject line for the email'
            },
            message_body: {
                type: 'TEXT',
                allowNull: false,
                display: 'Message Body',
                description: 'Email content (supports HTML and template variables)'
            },
            template_id: {
                type: 'STRING',
                allowNull: true,
                display: 'Template ID',
                description: 'Optional email template to use'
            },
            send_immediately: {
                type: 'BOOLEAN',
                allowNull: false,
                defaultValue: true,
                display: 'Send Immediately',
                description: 'Send emails immediately or queue for batch processing'
            }
        },
        default_interval: 0,
        default_interval_units: 's',
        default_run_count: 1,
        run_access: 'user',
        schedule_access: 'user',
        config_access: 'admin',
        is_enabled: true,
        supports_pause: false,
        supports_cancel: true,
        supports_undo: false,
        created_at: new Date('2025-01-16T09:30:00Z'),
        updated_at: new Date('2025-01-16T09:30:00Z')
    },{
        job_template_id: 'bdb4d4e7-ef40-455b-b0a5-e4eb368578db',
        name: 'Database Backup Job',
        class_name: 'DatabaseBackupJob',
        description: 'Automated database backup with compression and remote storage upload',
        start_type: 'scheduled',
        job_language: 'jsclass',
        job_command: null,
        configuration_schema: {
            backup_path: {
                type: 'STRING',
                allowNull: false,
                display: 'Backup Path',
                description: 'Local path where backup files will be stored before upload'
            },
            compress: {
                type: 'BOOLEAN',
                allowNull: false,
                defaultValue: true,
                display: 'Enable Compression',
                description: 'Compress backup files to save storage space'
            },
            remote_storage_url: {
                type: 'STRING',
                allowNull: true,
                display: 'Remote Storage URL',
                description: 'Optional remote storage endpoint for backup upload'
            },
            retention_days: {
                type: 'INTEGER',
                allowNull: false,
                defaultValue: 30,
                display: 'Retention Days',
                description: 'Number of days to keep backup files'
            }
        },
        default_interval: 24,
        default_interval_units: 'h',
        default_run_count: 0, 
        run_access: 'admin', 
        schedule_access: 'admin', 
        config_access: 'admin', 
        is_enabled: true, 
        supports_pause: true, 
        supports_cancel: true, 
        supports_undo: false,
        created_at: new Date('2025-01-15T10:00:00Z'),
        updated_at: new Date('2025-01-15T10:00:00Z')
    },    
    {
        job_template_id: 'f1e2d3c4-b5a6-9876-5432-1098765432ab',
        name: 'Data Import Processor',
        class_name: 'DataImportJob',
        description: 'Process CSV/Excel files and import data into the database with validation',
        start_type: 'adhoc-system',
        job_language: 'jsclass',
        job_command: null,
        configuration_schema: {
            file_path: {
                type: 'STRING',
                allowNull: false,
                display: 'File Path',
                description: 'Path to the data file to import'
            },
            table_name: {
                type: 'STRING',
                allowNull: false,
                display: 'Target Table',
                description: 'Database table to import data into'
            },
            validate_data: {
                type: 'BOOLEAN',
                allowNull: false,
                defaultValue: true,
                display: 'Validate Data',
                description: 'Run data validation before importing'
            },
            batch_size: {
                type: 'INTEGER',
                allowNull: false,
                defaultValue: 1000,
                display: 'Batch Size',
                description: 'Number of records to process in each batch'
            },
            skip_duplicates: {
                type: 'BOOLEAN',
                allowNull: false,
                defaultValue: false,
                display: 'Skip Duplicates',
                description: 'Skip records that already exist in the database'
            }
        },
        default_interval: 0,
        default_interval_units: 's',
        default_run_count: 1,
        run_access: 'admin',
        schedule_access: 'admin',
        config_access: 'admin',
        is_enabled: true,
        supports_pause: true,
        supports_cancel: true,
        supports_undo: true,
        created_at: new Date('2025-01-17T14:15:00Z'),
        updated_at: new Date('2025-01-17T14:15:00Z')
    },
    {
        job_template_id: '12345678-90ab-cdef-1234-567890abcdef',
        name: 'System Health Monitor',
        class_name: 'HealthMonitorJob',
        description: 'Monitor system resources and alert on threshold violations',
        start_type: 'service',
        job_language: 'javascript',
        job_command: `
// System health monitoring script
const os = require('os');
const fs = require('fs');

async function monitorHealth() {
  const metrics = {
    cpuUsage: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    uptime: os.uptime(),
    loadAverage: os.loadavg()
  };
  
  // Check thresholds and alert if necessary
  if (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal > 0.8) {
    console.warn('High memory usage detected');
  }
  
  return metrics;
}

monitorHealth();
      `.trim(),
        configuration_schema: {
            cpu_threshold: {
                type: 'INTEGER',
                allowNull: false,
                defaultValue: 80,
                display: 'CPU Threshold (%)',
                description: 'Alert when CPU usage exceeds this percentage'
            },
            memory_threshold: {
                type: 'INTEGER',
                allowNull: false,
                defaultValue: 85,
                display: 'Memory Threshold (%)',
                description: 'Alert when memory usage exceeds this percentage'
            },
            check_interval: {
                type: 'INTEGER',
                allowNull: false,
                defaultValue: 60,
                display: 'Check Interval (seconds)',
                description: 'How often to check system health'
            }
        },
        default_interval: 60,
        default_interval_units: 's',
        default_run_count: 0,
        run_access: 'system',
        schedule_access: 'admin',
        config_access: 'admin',
        is_enabled: false,
        supports_pause: true,
        supports_cancel: true,
        supports_undo: false,
        created_at: new Date('2025-01-18T08:00:00Z'),
        updated_at: new Date('2025-01-18T08:00:00Z')
    }];
};
