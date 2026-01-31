import request from "supertest";
import app from "../src/server";
import { EventEmitter } from "events";
import database from "../src/database";

// 1. Mock the @radar/lnrpc module
const mockRpc = {
    getInfo: jest.fn(),
    channelBalance: jest.fn(),
    signMessage: jest.fn(),
    verifyMessage: jest.fn(),
    addInvoice: jest.fn(),
    lookupInvoice: jest.fn(),
    subscribeInvoices: jest.fn(),
    decodePayReq: jest.fn(),
};

const mockRouterRpc = {
    sendPaymentV2: jest.fn(),
};

// Mock createLnRpc and createRouterRpc default export
jest.mock("@radar/lnrpc", () => {
    return {
        __esModule: true,
        default: jest.fn(() => Promise.resolve(mockRpc)),
        createRouterRpc: jest.fn(() => Promise.resolve(mockRouterRpc)),
    };
});

// 2. Mock the database module directly
jest.mock("../src/database", () => ({
    saveNode: jest.fn(),
    saveInvoice: jest.fn(),
    getInvoice: jest.fn(),
    getInvoices: jest.fn(),
    savePayment: jest.fn(),
    updatePayment: jest.fn(),
    getPayment: jest.fn(),
    getPayments: jest.fn(),
}));

describe("Backend API Integration Tests", () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default successful responses for LND connection
        mockRpc.getInfo.mockResolvedValue({
            identityPubkey: "test-pubkey",
            alias: "alice",
        });
        mockRpc.channelBalance.mockResolvedValue({});
        mockRpc.signMessage.mockResolvedValue({ signature: "test-sig" });
        mockRpc.verifyMessage.mockResolvedValue({ valid: true });

        // Mock stream for subscribeInvoices (needed during connect)
        const mockStream = new EventEmitter();
        mockRpc.subscribeInvoices.mockReturnValue(mockStream);

        // Required for connection verification
        mockRpc.addInvoice.mockResolvedValue({
            rHash: Buffer.from("test-rhash"),
        });
        mockRpc.lookupInvoice.mockResolvedValue({});
    });

    describe("POST /api/connect", () => {
        it("should return a token on successful connection", async () => {
            // Database mock
            (database.saveNode as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "hex-cert",
                macaroon: "hex-macaroon",
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("pubkey", "test-pubkey");
            expect(database.saveNode).toHaveBeenCalled();
        });

        it("should return 400 if connection fails", async () => {
            // Force createLnRpc to fail by mocking the module's default export behavior for this test
            // Note: Since we mocked the module at top level, we need to manipulate the mock implementation
            const createLnRpc = require("@radar/lnrpc").default;
            createLnRpc.mockRejectedValueOnce(new Error("Connection failed"));

            const response = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "bad-cert",
                macaroon: "bad-macaroon",
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("Invoice Operations", () => {
        let validToken: string;

        beforeEach(async () => {
            // Establish a valid session
            const res = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "cert",
                macaroon: "macaroon",
            });
            validToken = res.body.token;
            jest.clearAllMocks();
        });

        describe("POST /api/invoice", () => {
            it("should create an invoice and save to DB", async () => {
                const mockInvoice = {
                    rHash: Buffer.from("test-rhash"),
                    paymentRequest: "lnbc...",
                };
                const mockLookup = {
                    settled: false,
                    creationDate: "1678886400",
                    expiry: "3600",
                };

                mockRpc.addInvoice.mockResolvedValue(mockInvoice);
                mockRpc.lookupInvoice.mockResolvedValue(mockLookup);
                (database.saveInvoice as jest.Mock).mockResolvedValue(
                    undefined,
                );

                const response = await request(app)
                    .post("/api/invoice")
                    .set("X-Token", validToken)
                    .send({
                        amount: 1000,
                        memo: "Test Invoice",
                    });

                expect(response.status).toBe(200);
                expect(response.body.paymentRequest).toBe(
                    mockInvoice.paymentRequest,
                );
                expect(mockRpc.addInvoice).toHaveBeenCalledWith({
                    value: "1000",
                    memo: "Test Invoice",
                });
                expect(database.saveInvoice).toHaveBeenCalled();
            });
        });

        describe("GET /api/invoice/:payment_hash", () => {
            it("should return invoice status from DB", async () => {
                const dbInvoice = {
                    hash: "test-hash",
                    payment_request: "lnbc...",
                    amount: 1000,
                    memo: "Test",
                    settled: false,
                };
                (database.getInvoice as jest.Mock).mockResolvedValue(dbInvoice);

                const response = await request(app)
                    .get("/api/invoice/test-hash")
                    .set("X-Token", validToken);

                expect(response.status).toBe(200);
                expect(response.body).toEqual(dbInvoice);
                // Should NOT call LND for status, only DB
                expect(mockRpc.lookupInvoice).not.toHaveBeenCalled();
            });

            it("should return 404 if invoice not found", async () => {
                (database.getInvoice as jest.Mock).mockResolvedValue(null);

                const response = await request(app)
                    .get("/api/invoice/non-existent")
                    .set("X-Token", validToken);

                expect(response.status).toBe(404);
            });
        });
    });

    describe("Payment Operations", () => {
        let validToken: string;

        beforeEach(async () => {
            const res = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "cert",
                macaroon: "macaroon",
            });
            validToken = res.body.token;
            jest.clearAllMocks();
        });

        describe("POST /api/payment", () => {
            it("should execute payment using RouterRPC", async () => {
                const payReq = "lnbc...";
                const decoded = {
                    destination: "dest-pubkey",
                    paymentHash: "pay-hash",
                    numSatoshis: "1000",
                    description: "Test Pay",
                    timestamp: "1678886400",
                };

                mockRpc.decodePayReq.mockResolvedValue(decoded);
                mockRpc.getInfo.mockResolvedValue({
                    identityPubkey: "source-pubkey",
                });
                (database.getPayment as jest.Mock).mockResolvedValue(null); // No existing payment
                (database.savePayment as jest.Mock).mockResolvedValue(
                    undefined,
                );

                // Mock Router SendPaymentV2 stream
                const paymentStream = new EventEmitter();
                mockRouterRpc.sendPaymentV2.mockReturnValue(paymentStream);

                const response = await request(app)
                    .post("/api/payment")
                    .set("X-Token", validToken)
                    .send({ paymentRequest: payReq });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty(
                    "paymentHash",
                    decoded.paymentHash,
                );

                expect(mockRpc.decodePayReq).toHaveBeenCalledWith({ payReq });
                expect(mockRouterRpc.sendPaymentV2).toHaveBeenCalledWith({
                    paymentRequest: payReq,
                });
                expect(database.savePayment).toHaveBeenCalled();
            });

            it("should reject duplicate payments", async () => {
                const payReq = "lnbc...";
                const decoded = {
                    destination: "dest-pubkey",
                    paymentHash: "existing-hash",
                    numSatoshis: "1000",
                    description: "Test Pay",
                    timestamp: "1678886400",
                };

                mockRpc.decodePayReq.mockResolvedValue(decoded);
                mockRpc.getInfo.mockResolvedValue({
                    identityPubkey: "source-pubkey",
                });
                (database.getPayment as jest.Mock).mockResolvedValue({
                    status: 2,
                }); // Existing payment

                const response = await request(app)
                    .post("/api/payment")
                    .set("X-Token", validToken)
                    .send({ paymentRequest: payReq });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe("Payment already done");
            });
        });

        describe("GET /api/payment/:payment_hash", () => {
            it("should return payment status from DB", async () => {
                const dbPayment = {
                    paymentHash: "pay-hash",
                    status: 2, // SUCCEEDED
                    value: 1000,
                };
                (database.getPayment as jest.Mock).mockResolvedValue(dbPayment);

                const response = await request(app).get(
                    "/api/payment/pay-hash",
                );

                expect(response.status).toBe(200);
                expect(response.body).toEqual(dbPayment);
            });
        });
    });

    describe("General Data Endpoints", () => {
        describe("GET /api/transactions", () => {
            it("should combine and sort invoices and payments", async () => {
                const invoices = [
                    { hash: "inv1", creationDate: 100, type: "invoice" },
                ];
                const payments = [
                    { paymentHash: "pay1", creationDate: 200, type: "payment" },
                ];

                (database.getInvoices as jest.Mock).mockResolvedValue(invoices);
                (database.getPayments as jest.Mock).mockResolvedValue(payments);

                const response = await request(app).get("/api/transactions");

                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(2);
                // check sorting (descending by creationDate)
                expect(response.body[0]).toHaveProperty("paymentHash", "pay1"); // 200 > 100
                expect(response.body[1]).toHaveProperty("hash", "inv1");
            });
        });

        describe("GET /api/balance", () => {
            it("should calculate balance correctly", async () => {
                const invoices = [{ amount: 1000 }, { amount: 2000 }];
                const payments = [{ value: 500 }];

                (database.getInvoices as jest.Mock).mockResolvedValue(invoices);
                (database.getPayments as jest.Mock).mockResolvedValue(payments);

                const response = await request(app).get("/api/balance");

                expect(response.status).toBe(200);
                // 1000 + 2000 - 500 = 2500
                expect(response.body.balance).toBe(2500);
                expect(response.body.totalInvoices).toBe(3000);
                expect(response.body.totalPayments).toBe(500);
            });
        });
    });
});
