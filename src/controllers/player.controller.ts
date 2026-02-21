import type { Request, Response } from "express";
import { PlayerServices } from "../services";

export class PlayerController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message, data } = await PlayerServices.getOne(ci);
    return res.status(status).json({
      message,
      data,
    });
  };

  active = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getActive();
    return res.status(status).json({
      message,
      data,
    });
  };

  inactive = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getInactive();
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message, data } = await PlayerServices.update(ci, req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  softDelete = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message } = await PlayerServices.softDelete(ci);
    return res.status(status).json({
      message,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message } = await PlayerServices.delete(ci);
    return res.status(status).json({
      message,
    });
  };

  patch = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message, data } = await PlayerServices.patch(ci, req.body);
    return res.status(status).json({
      message,
      data,
    });
  };
}