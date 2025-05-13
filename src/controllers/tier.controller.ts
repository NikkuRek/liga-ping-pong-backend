import type { Request, Response } from "express"
import { TierServices } from "../services"

export class TierController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await TierServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await TierServices.getOne(Number(id))
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await TierServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await TierServices.update(Number(id), req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await TierServices.delete(Number(id))
    return res.status(status).json({
      message,
    })
  }
}
