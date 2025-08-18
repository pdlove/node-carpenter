import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'your_very_secure_jwt_secret_fallback_replace_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Middleware to authenticate JWT bearer tokens.
 * Attaches the decoded user payload to req.session.
 */

export function tokenMiddleware(carpenterServer) {
    TokenAuthentication.carpenterServer = carpenterServer
    return TokenAuthentication.authenticateToken;
}
export class TokenAuthentication {
    static carpenterServer = null;



    static async authenticateToken(req, res, next) {
        function handleError(error, isCritical) {
            //TODO: Audit Logging
            console.error(error);
            req.session = { error };
            if (isCritical) throw new Error(req.session.error);
            next();
        }

        const authHeader = req.headers['authorization'];
        const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
        const tokenFromCookie = req.cookies?.token; // Assuming cookie is named "token"

        const token = tokenFromHeader || tokenFromCookie;
        let user = null;
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET)
                //If user_type == "person" then tokenFromCookie needs to be non-null.
                //Otherwise tokenFromHeader should be non-null.
            } catch (error) {
                handleError(`Invalid Token: ${error}`);
                return;
            }
        } else {
            // No token provided, set the session to the guest/public session.
            if (TokenAuthentication.carpenterServer.options.singleUserMode) {
                user = { session_id: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF" }; // Single user mode, use the admin user session
            } else {
                user = { session_id: "00000000-0000-0000-0000-000000000000" };
            }
        }

        const Session = TokenAuthentication.carpenterServer.models.UserSession;
        let thisSession = await Session.browseObjects({ filter: { session_id: user.session_id } });
        if (thisSession.length !== 1) {
            handleError("Token Validation Error - No Session")
            return;
        }
        thisSession = thisSession[0];

        if (thisSession.status !== 'Active' && thisSession.status !== 'InActive') {
            //This session has previously been invalidated
            if (thisSession.length !== 1) {
                handleError(new Error(`Token Validation Error - $(thisSession.status) Session`))
                return;
            }
        }

        thisSession.last_use_time = new Date(); //We set last_use_time here so 

        if (thisSession.expire_time < new Date()) {
            //Session is Expired
            thisSession.status = "Expired";
            thisSession.save();
            handleError(new Error(`Token Validation Error - $(thisSession.status) Session`))
            return;
        }


        thisSession.save();

        let thisUser = await thisSession.getUser();


        let userGroups = await thisUser.getGroups();
        for (const group of userGroups) {
            let subGroup = await group.getParentGroup();
            while (subGroup.length>0) {
                subGroup=subGroup[0];
                userGroups.push(subGroup);
                subGroup = await subGroup.getParentGroup();
            }
        }
        //user.session_id
        //user.user_id 
        const returnObject = new SessionData();

        returnObject.session = thisSession;
        returnObject.user = thisUser;
        returnObject.user_id = thisUser.user_id;
        returnObject.groups = userGroups;
        returnObject.error = ""; //No error.
        req.session = returnObject; // The 'user' here is the decoded JWT payload
        //now that we have the user information from the token, we will verify the user hasn't locked out.

        if (next) next();
        return;
    };
    static generateJWT(tokenPayload) {
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return token;
    }
}
class SessionData {
    session = null;
    user = null;
    user_id="";
    groups = [];
    error = "";
    
    inGroup(groupName) {
        for (const group of this.groups) {
            if (group.name===groupName) return true;            
        }
        return false;        
    }

}

