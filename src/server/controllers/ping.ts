import type { Request, Response } from "express";

export const pingController = (req: Request, res: Response) => {
  res.status(200).send("OK");
};
