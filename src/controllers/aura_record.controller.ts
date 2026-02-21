import type { Request, Response } from "express"
import { AuraRecordServices } from "../services"

export class AuraRecordController {
  constructor() { }

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await AuraRecordServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await AuraRecordServices.getOne(Number(id))
    return res.status(status).json({
      message,
      data,
    })
  }

  getByPlayer = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message, data } = await AuraRecordServices.getByPlayer(ci);
    return res.status(status).json({
      message,
      data,
    });
  }

  getByMatch = async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { status, message, data } = await AuraRecordServices.getByMatch(Number(matchId));
    return res.status(status).json({
      message,
      data,
    });
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await AuraRecordServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await AuraRecordServices.update(Number(id), req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await AuraRecordServices.delete(Number(id))
    return res.status(status).json({
      message,
    })
  }
}
