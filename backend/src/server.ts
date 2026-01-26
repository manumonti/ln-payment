import express, { Request, Response } from "express";
import morgan from "morgan";
import * as routes from "./routes";

const app = express();

/**
 * morgan provides easy logging for express, and by default it logs to stdout
 * which is a best practice in Docker
 */
app.use(morgan("common"));
app.use(express.json());

/**
 * ExpressJS will hang if an async route handler doesn't catch errors and
 * return a response. To avoid wrapping every handler in try/catch, just call
 * this func on the handler. It will catch any async errors and return
 */
export const catchAsyncErrors = (
    routeHandler: (req: Request, res: Response) => Promise<void> | void,
) => {
    // return a function that wraps the route handler in a try/catch block and
    // sends a response on error
    return async (req: Request, res: Response) => {
        try {
            const promise = routeHandler(req, res);
            // only await promises from async handlers.
            if (promise) await promise;
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).send({ error: err.message });
            } else {
                res.status(400).send({ error: "Unknown error" });
            }
        }
    };
};

app.post("/api/connect", catchAsyncErrors(routes.connect));
app.post("/api/invoice", catchAsyncErrors(routes.createInvoice));
app.get("/api/invoice/:payment_hash", catchAsyncErrors(routes.invoiceStatus));
app.post("/api/payment", catchAsyncErrors(routes.payInvoice));
app.get("/api/payment/:payment_hash", catchAsyncErrors(routes.paymentStatus));
app.get("/api/transactions", catchAsyncErrors(routes.transactions));
app.get("/api/balance", catchAsyncErrors(routes.balance));

export default app;
