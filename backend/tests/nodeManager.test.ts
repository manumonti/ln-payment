import request from "supertest";
import app from "../src/server";
import { EventEmitter } from "events";

// 1. Mock the @radar/lnrpc module
const mockRpc = {
    getInfo: jest.fn(),
    channelBalance: jest.fn(),
    signMessage: jest.fn(),
    verifyMessage: jest.fn(),
    addInvoice: jest.fn(),
    lookupInvoice: jest.fn(),
    subscribeInvoices: jest.fn(),
};

// Mock createLnRpc default export
jest.mock("@radar/lnrpc", () => {
    return {
        __esModule: true,
        default: jest.fn(() => Promise.resolve(mockRpc)),
    };
});

describe("Node Manager API", () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default successful responses for connection flow
        mockRpc.getInfo.mockResolvedValue({ identityPubkey: "test-pubkey" });
        mockRpc.channelBalance.mockResolvedValue({});
        mockRpc.signMessage.mockResolvedValue({ signature: "test-sig" });
        mockRpc.verifyMessage.mockResolvedValue({ valid: true });
        mockRpc.addInvoice.mockResolvedValue({
            rHash: Buffer.from("test-rhash"),
            paymentRequest: "lnbc...",
        });
        mockRpc.lookupInvoice.mockResolvedValue({
            settled: false,
            creationDate: "123456789",
        });

        // Mock stream for subscribeInvoices
        const mockStream = new EventEmitter();
        mockRpc.subscribeInvoices.mockReturnValue(mockStream);
    });

    describe("POST /api/connect", () => {
        it("should return a token on successful connection", async () => {
            const response = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "hex-cert",
                macaroon: "hex-macaroon",
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
        });

        it("should return 400 if connection fails", async () => {
            // Force createLnRpc to fail
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

    describe("POST /api/invoice", () => {
        let validToken: string;

        beforeEach(async () => {
            // First connect to get a valid token
            const res = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "cert",
                macaroon: "macaroon",
            });
            validToken = res.body.token;
        });

        it("should create an invoice with valid token", async () => {
            const response = await request(app)
                .post("/api/invoice")
                .set("X-Token", validToken)
                .send({
                    amount: 1000,
                    memo: "Test Invoice",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("payreq");
            expect(response.body).toHaveProperty("hash");
            expect(mockRpc.addInvoice).toHaveBeenCalledWith({ value: "1000" });
        });

        it("should fail without token header", async () => {
            const response = await request(app).post("/api/invoice").send({
                amount: 1000,
            });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Missing token");
        });
    });

    describe("GET /api/invoice/:payment_hash", () => {
        let validToken: string;

        beforeEach(async () => {
            const res = await request(app).post("/api/connect").send({
                host: "127.0.0.1:10001",
                cert: "cert",
                macaroon: "macaroon",
            });
            validToken = res.body.token;
        });

        it("should return invoice status", async () => {
            const fakeHash = Buffer.from("test-hash").toString("base64");

            const response = await request(app)
                .get(`/api/invoice/${fakeHash}`)
                .set("X-Token", validToken);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("settled");
            expect(mockRpc.lookupInvoice).toHaveBeenCalled();
        });
    });
});
