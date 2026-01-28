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

    const { paymentRequest }: { paymentRequest: string } = req.body;
    const rpc = nodeManager.getRpc(token);
    const routerRpc = nodeManager.getRouterRpc(token);

    const decodedPayReq = await rpc.decodePayReq({
        payReq: paymentRequest,
    });

    const source = (await rpc.getInfo()).identityPubkey;

    const payment = {
        source,
        destination: decodedPayReq.destination,
        paymentHash: decodedPayReq.paymentHash,
        value: parseInt(decodedPayReq.numSatoshis),
        memo: decodedPayReq.description,
        creationDate: decodedPayReq.timestamp,
        paymentPreimage: null,
        paymentRequest,
        status: 1, // IN_FLIGHT
    };

    const existingPayment = await database.getPayment(payment.paymentHash);
    if (existingPayment) {
        res.status(400).send({ error: "Payment already done" });
        return;
    }

    // Save to the database. Update the status (failed, in flight, etc) later
    await database.savePayment(payment);

    const call = routerRpc.sendPaymentV2({ paymentRequest });

    // Attach error handler IMMEDIATELY to catch async errors
    call.on("error", (error: any) => {
        if (error.code === 6) {
            console.error("Payment already paid");
        } else {
            console.error("Payment stream error:", error);
            // update payment status to failed
            database.updatePayment({
                ...payment,
                status: 3, // FAILED
            });
        }
    });

    call.on("data", (response) => {
        database.updatePayment({
            ...payment,
            paymentPreimage: response.paymentPreimage,
            status: response.status,
        });
    });

    res.send({
        paymentHash: decodedPayReq.paymentHash,
    });
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
