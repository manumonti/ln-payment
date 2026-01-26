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
    const rpc = nodeManager.getRpc(token);

    const call = rpc.sendPayment({ paymentRequest });

    call.on("data", (response) => {
        console.log("response", response);
    });
    call.on("status", (status) => {
        console.log("status", status);
    });
    call.on("end", () => {
        console.log("Server has closed the stream");
    });

    call.write({ paymentRequest });

    res.send({ status: "pending" });
};
