import type { Request, Response } from "express"
import { CareerServices } from "../services"

export class CareerController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await CareerServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CareerServices.getOne(Number(id))
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await CareerServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CareerServices.update(Number(id), req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await CareerServices.delete(Number(id))
    return res.status(status).json({
      message,
    })
  }
}

// Exportación nombrada para resolver el error
