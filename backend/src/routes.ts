import { Request, Response } from "express";
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
    const { token, amount, memo } = req.body;
    const rpc = nodeManager.getRpc(token);
    console.log(rpc);
    const inv = await rpc.addInvoice({ value: amount.toString() });
    res.send({
        payreq: inv.paymentRequest,
        hash: (inv.rHash as Buffer).toString("base64"),
        amount,
        memo,
    });
    // TODO: save to database
};

// /**
//  * GET /api/invoice/:payment_hash
//  */
// export const invoiceStatus = async (req: Request, res: Response) => {
//     const { token, payment_hash } = req.params;
//     //     const rpc = nodeManager.getRpc(token);
//     //     const inv = await rpc.lookupInvoice({
//     //         rHash: Buffer.from(payment_hash, "base64"),
//     //     });
//     //     res.send(inv);
//     //     // TODO: save to database
// };
