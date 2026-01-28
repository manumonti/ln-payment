import { Request, Response } from "express";
import database from "./database";
import nodeManager from "./node-manager";

/**
 * POST /api/connect
 */
export const connect = async (req: Request, res: Response) => {
    const { host, cert, macaroon } = req.body;
    const { token } = await nodeManager.connect(host, cert, macaroon);
    res.send({ token });
};

/**
 * POST /api/invoice
 */
export const createInvoice = async (req: Request, res: Response) => {
    const token = req.header("X-Token");
    if (!token) throw new Error("Missing token");
    const { amount, memo } = req.body;
    const rpc = nodeManager.getRpc(token);
    const inv = await rpc.addInvoice({
        value: amount.toString(),
        memo: memo || "",
    });

    // look up the invoice to get the creation date and expiry
    const invLookedUp = await rpc.lookupInvoice({
        rHash: inv.rHash,
    });

    const rHash = (inv.rHash as Buffer).toString("hex");
    const paymentRequest = inv.paymentRequest;
    const settled = false;
    const creationDate = invLookedUp.creationDate;
    const settleDate = invLookedUp.settleDate;
    const expiry = invLookedUp.expiry;

    await database.saveInvoice(
        rHash,
        paymentRequest,
        amount,
        memo,
        settled,
        creationDate,
        settleDate,
        expiry,
    );

    res.send({
        rHash,
        paymentRequest,
        amount,
        memo,
        settled,
        creationDate,
        settleDate,
        expiry,
    });
};

/**
 * GET /api/invoice/:payment_hash
 */
export const invoiceStatus = async (req: Request, res: Response) => {
    const token = req.header("X-Token");
    if (!token) throw new Error("Missing token");

    const { payment_hash } = req.params;

    // no need to get invoice from db since lookupInvoice returns all the data
    const rpc = nodeManager.getRpc(token);
    const inv = await rpc.lookupInvoice({
        rHash: Buffer.from(payment_hash as string, "hex"),
    });

    if (!inv) {
        res.status(404).send({ error: "No invoice found" });
    }

    const rHash = (inv.rHash as Buffer).toString("hex");
    const paymentRequest = inv.paymentRequest;
    const amount = inv.value;
    const memo = inv.memo;
    const settled = inv.settled || false;
    const creationDate = inv.creationDate;
    const settleDate = inv.settleDate || null;
    const expiry = inv.expiry;

    res.send({
        rHash,
        paymentRequest,
        amount,
        memo,
        settled,
        creationDate,
        settleDate,
        expiry,
    });
};

/**
 * POST /api/payment
 */
export const payInvoice = async (req: Request, res: Response) => {
    const token = req.header("X-Token");
    if (!token) throw new Error("Missing token");

    const { paymentRequest } = req.body;
    const rpc = nodeManager.getRouterRpc(token);

    const call = rpc.sendPaymentV2({ paymentRequest });

    // TODO: save to the database
    call.on("data", (response) => {
        console.log("response", response);
    });
    call.on("status", (status) => {
        console.log("status", status);
    });
    call.on("end", () => {
        console.log("Server has closed the stream");
    });

    // TODO: what to return here?
    res.send({});
};

/**
 * GET /api/payment/:payment_hash
 */
export const paymentStatus = async (req: Request, res: Response) => {
    // TODO: get payment status (from database and node)
    res.send({});
};

/**
 * GET /api/transactions
 */
export const transactions = async (req: Request, res: Response) => {
    // TODO: List all transactions from database
    res.send({});
};

/**
 * GET /api/balance
 */
export const balance = async (req: Request, res: Response) => {
    // TODO: Get total balance from recorded transactions (invoices received minus payments sent)
    res.send({});
};
