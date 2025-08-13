import { CarpenterRoute } from "../../CarpenterRoute.js";
import path from "path";
import babel from "@babel/core";

export class Components extends CarpenterRoute {
    static apiRoutes() {
        return [
            { path: ('/part/:filename'), method: "GET", function: this.transpileRequest.bind(this), isAPI: true },
        ]
    }

    static async transpileRequest(req, res) {
        // Get the requested file name from the URL parameter.
        // The `.jsx` extension is appended to find the correct file on the server.

        //The filename parameter converts everything to lowercase but we want to keep it case specific, so we'll fetch the original value

        const fnameStart = req.url.indexOf("/part") + 6;
        const fileName = req.url.substring(fnameStart);
        const fullPath = path.join(this.carpenterServer.frontEndPath, "reactFiles", fileName);
        //TODO: Handle non-jsx files
        // Use Babel to transform the JSX file.
        // The 'react' preset is what handles the conversion from JSX to React.createElement calls.

        try {
            const result = babel.transformFileSync(fullPath, { presets: ['@babel/preset-react'] });
            // Send the transpiled code to the client with the correct content type.
            res.setHeader('Content-Type', 'application/javascript');
            res.send(result.code);
            return true;
        } catch (error) {
            console.error('Babel transpilation error:', error);
            res.status(500).send('Error transpiling JSX file.');
            return true;
        }

    }
}

