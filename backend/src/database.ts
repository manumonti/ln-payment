import { Pool, PoolClient } from "pg";
import { LndNode } from "./node-manager";

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
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

            await client.query(`
                    CREATE TABLE IF NOT EXISTS invoices (
                        id SERIAL PRIMARY KEY,
                        hash VARCHAR(255) UNIQUE NOT NULL,
                        payment_request TEXT NOT NULL,
                        amount BIGINT NOT NULL,
                        memo TEXT,
                        creation_date TIMESTAMP,
                        expiry INT
                    );
                `);

            await client.query(`
                    CREATE TABLE IF NOT EXISTS payments (
                        id SERIAL PRIMARY KEY,
                        source VARCHAR(66) NOT NULL,
                        destination VARCHAR(66) NOT NULL,
                        payment_hash VARCHAR(255) UNIQUE NOT NULL,
                        value BIGINT NOT NULL,
                        memo TEXT,
                        creation_date TIMESTAMP,
                        payment_preimage VARCHAR(255),
                        payment_request TEXT NOT NULL,
                        status INT NOT NULL
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

    async getNodes(): Promise<LndNode[]> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const result = await this.query("SELECT * FROM nodes");

        const nodes: LndNode[] = result.rows.map((row) => ({
            token: row.token,
            host: row.host,
            cert: row.cert,
            macaroon: row.macaroon,
            pubkey: row.pubkey,
        }));

        return nodes;
    }

    async saveNode(
        token: string,
        host: string,
        cert: string,
        macaroon: string,
        pubkey: string,
    ): Promise<void> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const now = new Date();
        // Remove previous entries with the same host
        await this.query("DELETE FROM nodes WHERE host = $1", [host]);
        await this.query(
            `INSERT INTO nodes (token, host, cert, macaroon, pubkey, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
            [token, host, cert, macaroon, pubkey, now],
        );
    }

    async saveInvoice(
        hash: string,
        payreq: string,
        amount: number,
        memo: string,
        settled: boolean,
        creationDate: string | undefined,
        settleDate: string | undefined,
        expiry: string | undefined,
    ): Promise<void> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }

        const creationDateFormatted = creationDate
            ? new Date(Number(creationDate) * 1000)
            : null;
        const settleDateFormatted = settleDate
            ? new Date(Number(settleDate) * 1000)
            : null;
        const expiryFormatted = expiry ? Number(expiry) : null;

        await this.query(
            `INSERT INTO invoices (hash, payment_request, amount, memo, creation_date, expiry) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                hash,
                payreq,
                amount,
                memo,
                creationDateFormatted,
                expiryFormatted,
            ],
        );
    }

    // TODO: remove this if not needed
    // async updateInvoice(
    //     hash: string,
    //     inv: {
    //         hash: string;
    //         payreq: string;
    //         amount: number;
    //         memo: string;
    //         settled: boolean;
    //         creationDate: string | undefined;
    //         settleDate: string | undefined;
    //         expiry: string | undefined;
    //     },
    // ): Promise<void> {
    //     if (!this.pool) {
    //         throw new Error(
    //             "Database pool is not initialized. Call connect() first.",
    //         );
    //     }
    //     await this.query(
    //         `UPDATE invoices SET payment_request = $2, amount = $3, memo = $4, settled = $5, creation_date = $6, settle_date = $7, expiry = $8 WHERE hash = $1`,
    //         [
    //             hash,
    //             inv.payreq,
    //             inv.amount,
    //             inv.memo,
    //             inv.settled,
    //             inv.creationDate,
    //             inv.settleDate,
    //             inv.expiry,
    //         ],
    //     );
    // }

    async getInvoice(hash: string): Promise<{
        hash: string;
        payreq: string;
        amount: number;
        memo: string;
        creationDate: string | undefined;
        expiry: string | undefined;
    }> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const result = await this.query(
            "SELECT * FROM invoices WHERE hash = $1",
            [hash],
        );

        return result.rows[0];
    }

    async getInvoices(): Promise<
        {
            hash: string;
            payreq: string;
            amount: number;
            memo: string;
            creationDate: string | undefined;
            expiry: string | undefined;
        }[]
    > {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const result = await this.query("SELECT * FROM invoices");

        return result.rows;
    }

    async savePayment(payment: {
        source: string;
        destination: string;
        paymentHash: string;
        value: number;
        memo: string;
        creationDate: string;
        paymentPreimage: string | null;
        paymentRequest: string;
        status: number;
    }): Promise<void> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const creationDateFormatted = new Date(
            Number(payment.creationDate) * 1000,
        );
        await this.query(
            `INSERT INTO payments (source, destination, payment_hash, value, memo, creation_date, payment_preimage, payment_request, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                payment.source,
                payment.destination,
                payment.paymentHash,
                payment.value,
                payment.memo,
                creationDateFormatted,
                payment.paymentPreimage,
                payment.paymentRequest,
                payment.status,
            ],
        );
    }

    async updatePayment(payment: {
        source: string;
        destination: string;
        paymentHash: string;
        value: number;
        memo: string;
        creationDate: string;
        paymentPreimage: string | null;
        paymentRequest: string;
        status: number;
    }): Promise<void> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const creationDateFormatted = new Date(
            Number(payment.creationDate) * 1000,
        );
        await this.query(
            `UPDATE payments SET source = $1, destination = $2, payment_hash = $3, value = $4, memo = $5, creation_date = $6, payment_preimage = $7, payment_request = $8, status = $9 WHERE payment_hash = $10`,
            [
                payment.source,
                payment.destination,
                payment.paymentHash,
                payment.value,
                payment.memo,
                creationDateFormatted,
                payment.paymentPreimage,
                payment.paymentRequest,
                payment.status,
                payment.paymentHash,
            ],
        );
    }

    async getPayment(paymentHash: string): Promise<{
        source: string;
        destination: string;
        paymentHash: string;
        value: number;
        memo: string;
        creationDate: string;
        paymentPreimage: string | null;
        paymentRequest: string;
        status: number;
    }> {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const result = await this.query(
            "SELECT * FROM payments WHERE payment_hash = $1",
            [paymentHash],
        );

        return result.rows[0];
    }

    async getPayments(): Promise<
        {
            source: string;
            destination: string;
            paymentHash: string;
            value: number;
            memo: string;
            creationDate: string;
            paymentPreimage: string | null;
            paymentRequest: string;
            status: number;
        }[]
    > {
        if (!this.pool) {
            throw new Error(
                "Database pool is not initialized. Call connect() first.",
            );
        }
        const result = await this.query("SELECT * FROM payments");

        return result.rows;
    }
}

export default new Database();
