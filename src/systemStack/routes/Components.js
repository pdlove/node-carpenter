import CarpenterRoute from "../../lib/CarpenterRoute.js";
import path from "path";
import babel from "@babel/core";

export default class Components extends CarpenterRoute {
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
        const prefixEnd = req.url.indexOf("/", fnameStart);
        const prefix = req.url.substring(fnameStart, prefixEnd);
        const fileName = req.url.substring(prefixEnd+1, req.url.length)
        
        
        //Get the prefix from the path.

        const fullPath = path.join(this.carpenterServer.componentPaths[prefix], fileName);

        //TODO: Handle non-jsx files
        // Use Babel to transform the JSX file.
        // The 'react' preset is what handles the conversion from JSX to React.createElement calls.

        try {
            const presets = [
                ["@babel/preset-react", { pragma: "h", pragmaFrag: "Fragment"}]                
            ];
            const result = babel.transformFileSync(fullPath, { presets });
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

