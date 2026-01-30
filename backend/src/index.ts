import dotenv from "dotenv";
import { Server } from "socket.io";
import database from "./database";
import nodeManager, { NodeEvents } from "./node-manager";
import app from "./server";

// Load .env file only if it exists (for local development)
// In Docker, environment variables are injected via docker-compose
dotenv.config({ path: "../.env" });

const port = process.env.SERVER_PORT || 3000;

/**
 * Initialize the server and database
 */
async function startServer() {
    try {
        // Connect to the database
        await database.connect(
            process.env.POSTGRES_HOST,
            Number(process.env.POSTGRES_PORT),
            process.env.POSTGRES_USER,
            process.env.POSTGRES_PW,
            process.env.POSTGRES_DB,
        );

        // Initialize database tables
        await database.initializeTables();

        // Start the Express server
        const server = app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });

        // Initialize Socket.io to enable real-time updates to the frontend
        const io = new Server(server, {
            cors: {
                origin: `http://localhost:${process.env.FRONTEND_PORT || 4000}`,
                methods: ["GET", "POST"],
            },
        });

        // Listen for invoice payments and update database
        nodeManager.on(
            NodeEvents.invoicePaid,
            async ({ hash, pubkey, settled, settleDate }) => {
                await database.updateInvoice(hash, settled, settleDate);
                io.emit("invoice-paid", { hash, pubkey, settled, settleDate });
            },
        );

        // Reconnect to LND nodes
        const nodes = await database.getNodes();
        await nodeManager.reconnectNodes(nodes);

        // Graceful shutdown
        process.on("SIGTERM", async () => {
            console.log("SIGTERM signal received: closing HTTP server");
            server.close(() => {
                console.log("HTTP server closed");
            });
            await database.close();
            io.close();
            process.exit(0);
        });

        process.on("SIGINT", async () => {
            console.log("SIGINT signal received: closing HTTP server");
            server.close(() => {
                console.log("HTTP server closed");
            });
            await database.close();
            io.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
