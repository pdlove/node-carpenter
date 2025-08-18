import Organization from './physical/Organization.js';
import Location from './physical/Location.js';


import Person from './UserSystem/Person.js';
import User from './UserSystem/User.js';
import SecurityGroup from './UserSystem/SecurityGroup.js';
import SecurityGroupUserMembership from './UserSystem/SecurityGroupUserMembership.js';
import SecurityGroupGroupMembership from './UserSystem/SecurityGroupGroupMembership.js';
import UserSession from './UserSystem/UserSession.js';

import CarpenterWorker from './system/CarpenterWorker.js';

export const modelList = {
    Organization,
    
    Person,
    User,
    SecurityGroup,
    SecurityGroupUserMembership,
    SecurityGroupGroupMembership,
    UserSession,
    Location,

    CarpenterWorker
};
export const modelSeedOrder = ['Organization','Person','User', 'SecurityGroup', 'SecurityGroupGroupMembership', 'SecurityGroupUserMembership', 'UserSession','Location','CarpenterWorker'];