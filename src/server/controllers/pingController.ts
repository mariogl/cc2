import type { Request, Response } from "express";

const pingController = (req: Request, res: Response) => {
  res.status(200).send("OK");
};

export default pingController;
