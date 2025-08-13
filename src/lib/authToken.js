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
                //If userType == "person" then tokenFromCookie needs to be non-null.
                //Otherwise tokenFromHeader should be non-null.
            } catch (error) {
                handleError(`Invalid Token: ${error}`);
                return;
            }
        } else {
            //TODO: Populate as Guest User
            handleError(`Invalid Token: No Token Presented`);
            return;
        }

        const Session = TokenAuthentication.carpenterServer.models.UserSession;
        let thisSession = await Session.browseObjects({ filter: { sessionId: user.sessionId } });
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

        thisSession.lastUseTime = new Date(); //We set lastUseTime here so 

        if (thisSession.expireTime < new Date()) {
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
        //user.sessionId
        //user.userId 
        const returnObject = new SessionData();

        returnObject.session = thisSession;
        returnObject.user = thisUser;
        returnObject.userId = thisUser.userId;
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
    userId="";
    groups = [];
    error = "";
    
    inGroup(groupName) {
        for (const group of this.groups) {
            if (group.name===groupName) return true;            
        }
        return false;        
    }

}

