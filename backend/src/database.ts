import { Pool, PoolClient } from "pg";

/**
 * Database connection pool for PostgreSQL
 */
class Database {
    private pool: Pool | null = null;

    /**
     * Initialize the database connection pool
     */
    async connect(): Promise<void> {
        try {
            this.pool = new Pool({
                host: process.env.POSTGRES_HOST || "localhost",
                port: parseInt(process.env.POSTGRES_PORT || "5432"),
                user: process.env.POSTGRES_USER || "admin",
                password: process.env.POSTGRES_PW || "admin",
                database: process.env.POSTGRES_DB || "postgres",
            });

            // Test the connection
            const client = await this.pool.connect();
            console.log("✅ Successfully connected to PostgreSQL database");
            client.release();
        } catch (error) {
            console.error(
                "❌ Failed to connect to PostgreSQL database:",
                error,
            );
            throw error;
        }
    }

    /**
     * Initialize database tables
     */
    async initializeTables(): Promise<void> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }

        const client = await this.pool.connect();

        try {
            // Create nodes table to store LND node connections
            await client.query(`
                    CREATE TABLE IF NOT EXISTS nodes (
                        id SERIAL PRIMARY KEY,
                        token VARCHAR(255) UNIQUE NOT NULL,
                        host VARCHAR(255) NOT NULL,
                        cert TEXT NOT NULL,
                        macaroon TEXT NOT NULL,
                        pubkey VARCHAR(66) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

            console.log("✅ Database tables initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize database tables:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get a client from the pool for manual transaction management
     */
    async getClient(): Promise<PoolClient> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        return await this.pool.connect();
    }

    /**
     * Execute a query using the pool
     */
    async query(text: string, params?: any[]) {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        return await this.pool.query(text, params);
    }

    /**
     * Close the database connection pool
     */
    async close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            console.log("Database connection pool closed");
            this.pool = null;
        }
    }

    async saveNode(
        token: string,
        host: string,
        cert: string,
        macaroon: string,
        pubkey: string,
    ): Promise<void> {
        const now = new Date();
        // Remove previous entries with the same host
        await this.query("DELETE FROM nodes WHERE host = $1", [host]);
        await this.query(
            `INSERT INTO nodes (token, host, cert, macaroon, pubkey, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [token, host, cert, macaroon, pubkey, now, now],
        );
    }
}

export default new Database();
