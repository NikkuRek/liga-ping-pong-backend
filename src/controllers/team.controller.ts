import type { Request, Response } from "express";
import { TeamServices } from "../services";

export class TeamController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await TeamServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TeamServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByPlayer = async (req: Request, res: Response) => {
    const { CI } = req.params;
    const { status, message, data } = await TeamServices.getByPlayer(CI);
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await TeamServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TeamServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await TeamServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };
}
