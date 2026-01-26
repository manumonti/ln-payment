import { Request, Response } from "express";
import nodeManager from "./node-manager";
import { SendRequest } from "@radar/lnrpc";

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
    const inv = await rpc.addInvoice({ value: amount.toString() });
    res.send({
        payreq: inv.paymentRequest,
        hash: (inv.rHash as Buffer).toString("base64"),
        amount,
        memo,
    });
    // TODO: save to database
};

/**
 * GET /api/invoice/:payment_hash
 */
export const invoiceStatus = async (req: Request, res: Response) => {
    const token = req.header("X-Token");
    if (!token) throw new Error("Missing token");

    const { payment_hash } = req.params;
    const rHash = Buffer.from(payment_hash as string, "base64");

    const rpc = nodeManager.getRpc(token);
    const inv = await rpc.lookupInvoice({
        rHash,
    });
    res.send({
        settled: inv.settled || false,
        creationDate: inv.creationDate,
        settleDate: inv.settleDate || null,
    });
    // TODO: read data from database
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

    // TODO: save to database the status of the payment
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
