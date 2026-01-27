import app from "./server";
import database from "./database";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const port = process.env.SERVER_PORT || 3000;

/**
 * Initialize the server and database
 */
async function startServer() {
    try {
        // Connect to the database
        await database.connect();

        // Initialize database tables
        await database.initializeTables();

        // Start the Express server
        const server = app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });

        // Graceful shutdown
        process.on("SIGTERM", async () => {
            console.log("SIGTERM signal received: closing HTTP server");
            server.close(() => {
                console.log("HTTP server closed");
            });
            // await database.close();
            process.exit(0);
        });

        process.on("SIGINT", async () => {
            console.log("SIGINT signal received: closing HTTP server");
            server.close(() => {
                console.log("HTTP server closed");
            });
            // await database.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
