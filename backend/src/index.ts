import express, { NextFunction, Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());
app.get("/", (req: Request, res: Response) => {
    res.send({ message: "Hello World" });
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send("Something's wrong");
});

app.listen(port, () => {
    console.log(`Server is running on ports ${port}`);
});
