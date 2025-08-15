import Organization from './UserSystem/Organization.js';
import User from './UserSystem/User.js';
import SecurityGroup from './UserSystem/SecurityGroup.js';
import SecurityGroupUserMembership from './UserSystem/SecurityGroupUserMembership.js';
import SecurityGroupGroupMembership from './UserSystem/SecurityGroupGroupMembership.js';
import UserSession from './UserSystem/UserSession.js';

const modelList = {
    Organization,
    User,
    SecurityGroup,
    SecurityGroupUserMembership,
    SecurityGroupGroupMembership,
    UserSession
};



export { modelList };
export const seedOrder = ['Organization', 'User', 'SecurityGroup', 'SecurityGroupGroupMembership', 'SecurityGroupUserMembership', 'UserSession'];