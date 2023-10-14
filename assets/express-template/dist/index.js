import { config } from "dotenv";
import express from "express";
import { Router } from "./api/Router.js";
import bodyParser from "body-parser";
const init = async () => {
    config();
    const app = express();
    app.use(bodyParser.json());
    app.use("/", Router);
    app.get("/", (req, res) => res.status(200).send("Hello from local server"));
    const args = process.argv.slice(2);
    let port = 8080;
    if (args.length > 0) {
        port = parseInt(args[0]);
    }
    const server = app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
    // Handle server shutdown gracefully
    process.on("SIGTERM", () => {
        // console.log('Received SIGTERM. Shutting down gracefully...');
        server.close(() => {
            console.log("Express server closed.");
            process.exit(0);
        });
    });
    process.on("SIGINT", () => {
        // console.log('Received SIGINT. Shutting down gracefully...');
        server.close(() => {
            console.log("Express server closed.");
            process.exit(0);
        });
    });
};
init();
//# sourceMappingURL=index.js.map