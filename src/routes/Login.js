import { CarpenterRoute } from "../../CarpenterRoute.js";
import { TokenAuthentication } from "../../authToken.js"

import { TOTP } from "otpauth";
import bcrypt from "bcrypt";

const SESSION_EXPIRATION_HOURS = 24;

export class Login extends CarpenterRoute {
    static defaultAccess = "public";

    static apiRoutes() {
        return [
            { path: ('/api/login'), method: "POST", function: this.processLogin.bind(this), isAPI: true },
            { path: ('/api/login/check'), method: "GET", function: this.processLoginCheck.bind(this), isAPI: true },
        ]
    }
    static async processLogin(req, res) {
        const { email, password, otp } = req.body;

        //Models used here:
        const { User, UserSession, UserTeamMembership, UserTeam } = this.carpenterServer.models;
        // 1. Basic input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        try {
            // 2. Find the user by email
            let user = await User.browseObjects({ filter: { email } });
            if (user.length !== 1) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            user = user[0];

            // 3. Compare the provided password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            // 4. Handle OTP verification
            if (user.otpKey) { // User has OTP configured
                if (!otp) {
                    return res.status(401).json({ message: 'OTP Required' });
                }

                // Create a TOTP instance using the stored OTP key
                // Note: In a real application, you'd securely store the OTP key and use appropriate encoding (base32)
                // The otpKey in your model is currently a simple string, it should ideally be base32 encoded.
                // For this example, we assume it's directly usable or handle potential decoding if needed.
                const totp = new TOTP({
                    secret: user.otpKey, // Assuming user.otpKey is a direct string or needs decoding (e.g., base32)
                    digits: 6, // Typically 6 digits for TOTP
                    period: 30, // Typically 30 seconds for TOTP
                    algorithm: 'SHA1', // Common algorithm
                });

                // Validate the provided OTP
                const otpDelta = totp.validate({ token: otp, window: 1 });

                if (otpDelta === null) {
                    return res.status(401).json({ message: 'Invalid OTP.' });
                }
            } else { // User does NOT have OTP configured
                if (otp) {
                    // If OTP was provided but user doesn't have it, consider it an invalid attempt
                    return res.status(401).json({ message: 'OTP not configured for this account.' });
                }
                // No OTP provided and none configured, proceed
            }

            //TODO: Check for lockout or password expiration

            //Successful login: Create Session
            const now = new Date();
            const expireTime = new Date(now.getTime() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000); // e.g., 24 hours from now
            const srcIPAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';


            const newSession = await UserSession.addObject({
                userId: user.userId, // Assuming your User model has a 'userId' field
                srcIPAddress,
                userAgent,
                startTime: now,
                expireTime,
                status: 'Active',
                mfaVerified: ((user.otpKey || '') != ''),
                lastUseTime: new Date()
            });

            // 6. Generate JWT Token
            const tokenPayload = {
                sessionId: newSession.sessionId,
                userId: user.userId
                // Add any other non-sensitive data needed in the token
            };
            const jwtToken = TokenAuthentication.generateJWT(tokenPayload);

            // 7. Respond with token for the client
            if (user.userType == 'person') { //If the userType is "person" then respond with a cookie only.
                res.cookie('token', jwtToken, {
                    httpOnly: true,      // Prevents JS access (important for security)
                    //secure: true,        // Only send over HTTPS
                    sameSite: 'Lax',     // Or 'Strict'/'None' depending on your needs
                    maxAge: 1000 * 60 * 60 * SESSION_EXPIRATION_HOURS, // 1 day
                });
                res.status(200).json({
                    message: 'Login successful',
                    email: user.email,
                });
            } else { //All other userTypes need the token returned.
                res.status(200).json({
                    message: 'Login successful',
                    email: user.email,
                    userType: user.userType,
                    token: jwtToken,
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'An error occurred during login.', error: error.message });
        }
    }

    static async processLoginCheck(req, res) {
        if (req.session.error)
            res.status(403).send(req.session.error);
        else
            res.status(200).json({ mesage: "Good" });
    }
}

