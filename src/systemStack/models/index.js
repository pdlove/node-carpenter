import Organization from './physical/Organization.js';
import Location from './physical/Location.js';


import Person from './UserSystem/Person.js';
import User from './UserSystem/User.js';
import SecurityGroup from './UserSystem/SecurityGroup.js';
import SecurityGroupUserMembership from './UserSystem/SecurityGroupUserMembership.js';
import SecurityGroupGroupMembership from './UserSystem/SecurityGroupGroupMembership.js';
import UserSession from './UserSystem/UserSession.js';

import CarpenterWorker from './system/CarpenterWorker.js';
import MenuItem from './system/menuItem.js';

import JobTemplate from './JobSystem/JobTemplate.js';
import JobSchedule from './JobSystem/JobSchedule.js';
import JobExecution  from './JobSystem/JobExecution.js';
import JobExecutionLog from './JobSystem/JobExecutionLog.js';

export const modelList = {
    Organization,
    
    Person,
    User,
    SecurityGroup,
    SecurityGroupUserMembership,
    SecurityGroupGroupMembership,
    UserSession,
    Location,

    CarpenterWorker,
    MenuItem, 
    
    
    JobTemplate,
    JobSchedule,
    JobExecution,
    JobExecutionLog
};

export const modelSeedOrder = ['Organization','Person','User', 'SecurityGroup', 'SecurityGroupGroupMembership', 'SecurityGroupUserMembership', 'UserSession','Location',
                                'CarpenterWorker', 'MenuItem',
                                'JobTemplate', 'JobSchedule', 'JobExecution', 'JobExecutionLog'];