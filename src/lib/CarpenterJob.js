export default class CarpenterJob {
    carpenterServer = null; // This will be populated with the carpenterServer object upon execution.
    
    // Job Template metadata - these define the template that appears in the admin interface
    static templateID = 'bdb4d4e7-ef40-455b-b0a5-e4eb368578db'; // UUID from database for this Job Template
    static templateName = 'Base Class'; // Display name of the Job Template
    static templateDescription = ''; // User-friendly description of what this Job Template does
    
    // Execution settings
    static jobLanguage = 'jsclass'; // javascript, powershell, sh, jsclass
    static jobCommand = ''; // Not used for jsclass. All others put the text of the command here.
    static startType = 'adhoc-user'; // adhoc-user, adhoc-system, scheduled, service
    
    // Default Job Schedule settings - used when creating new Job Schedules from this template
    static defaultInterval = 0; // Default time interval for scheduled jobs
    static defaultIntervalUnits = 's'; // Default time interval unit (s, m, h, d)
    static defaultRunCount = 1; // Default number of times to run for scheduled jobs
    
    // Configuration schema - defines what parameters this Job Template accepts
    static defaultConfiguration = {
        test_string: { 
            type: DataTypes.STRING, 
            allowNull: true, 
            display: "Test String", 
            description: "No default value is supplied so the user MUST add a string when creating a Job Schedule." 
        },
        test_number: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            defaultValue: 1, 
            display: "Test Number", 
            description: "You can put anything you want here." 
        }
    };

    // Security settings
    static defaultRunAccess = 'admin'; // Security Group able to create Job Schedules and run Job Executions
    static defaultScheduleAccess = 'admin'; // Security Group able to execute existing Job Schedules only
    static defaultConfigAccess = 'admin'; // Security Group able to modify Job Schedule configurations

    // Template capabilities
    static isEnabled = false;
    static supportsPause = false;
    static supportsCancel = false;
    static supportsUndo = false;

    // Event handlers for Job Execution lifecycle
    event_statusChange(status, message) {
        console.log('Status changed:', status, message); 
        return true; // Return true to confirm the status change and stop processing
    }
    
    event_jobComplete(status, message) { 
        console.log("Job Execution Complete", status, message); 
        return true; // Return true to confirm the job is complete and stop processing
    }
    
    event_jobError(status, message) { 
        console.log("Job Execution Error", status, message);
        return true; // Return true to confirm the error is serious and stop processing. If the job supports undo, it will try to undo
    } 
    
    async reportStatus(status, message) {
        // Updates the Job Execution record with current status and heartbeat
        console.log('Reporting status:', status, message);
    }

    static async validateConfiguration(config) {
        // Validates that the configuration matches the schema and business rules
        // Called when creating/updating Job Schedules
        try {
            // TODO: Implement validation logic against defaultConfiguration schema
            const data = { status: "Validation Not Implemented", isValid: false }
            return data;
        }
        catch (err) {
            return { status: "Validation Error", isValid: false, error: err.message };
        }
    }

    static async createJobExecution(scheduleConfig, priority = 0) {
        // Creates a Job Execution record in the database for servers to claim
        // This can be called from a Job Schedule (automated) or directly (ad-hoc)
        // Sets initial status to indicate it's ready to be claimed by a server
        try {
            // TODO: Create Job Execution record with:
            // - Reference to this Job Template
            // - Configuration from the Job Schedule or direct parameters
            // - Priority level
            // - Status: 'pending' or similar
            const data = { status: "Job Execution Creation Not Implemented" }
            return data;
        }
        catch (err) {
            return { status: "Creation Error", error: err.message };
        }
    }
    
    constructor(executionConfig) {
        // Constructor is called when a server claims a Job Execution
        this.loadConfig(executionConfig)
    }

    loadConfig(newConfig) {
        // Loads and validates the configuration from the Job Execution record
        if (!newConfig) newConfig = {};
        this.config = {};
        
        for (const [key, value] of Object.entries(this.constructor.defaultConfiguration)) {
            // If the execution config value is set, use it
            if (newConfig[key] !== undefined) {
                this.config[key] = newConfig[key];
                continue;                
            }
            // If the config value is already set in this instance, use it
            if (this.config[key] !== undefined) {
                continue;                
            }
            // If the config value isn't set and a default exists, use it
            if (value.defaultValue !== undefined) {
                this.config[key] = value.defaultValue;
                continue;
            }
            // If all else fails, set it to null so it isn't undefined
            this.config[key] = null;
        }
    }

    async runJob() {
        // Executes the actual job logic
        // Called by the server after claiming and verifying the Job Execution
        // Should regularly call reportStatus() for heartbeat updates
        try {
            const data = { status: "Job Implementation Not Complete" }
            return data;
        }
        catch (err) {
            return { status: "Execution Error", error: err.message };
        }
    }

    async cancelJob(attemptUndo = true) {
        // Cancels the running job
        // If this job supports undo and attemptUndo is true, tries to reverse changes
        try {
            const data = { status: "Cancel Not Implemented" }
            return data;
        }
        catch (err) {
            return { status: "Cancel Error", error: err.message };
        }
    }

    async pauseJob() {
        // Pauses the job execution (if supported)
        // Job should be resumable from this point
        try {
            const data = { status: "Pause Not Implemented" }
            return data;
        }
        catch (err) {
            return { status: "Pause Error", error: err.message };
        }
    }

    async resumeJob() {
        // Resumes a paused job execution
        try {
            const data = { status: "Resume Not Implemented" }
            return data;
        }
        catch (err) {
            return { status: "Resume Error", error: err.message };
        }
    }
}