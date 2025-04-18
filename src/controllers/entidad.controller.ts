import type { Request, Response } from "express"
import { EntidadServices } from "../services"

export class EntidadController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await EntidadServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await EntidadServices.getOne(Number(id))
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await EntidadServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await EntidadServices.update(Number(id), req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await EntidadServices.delete(Number(id))
    return res.status(status).json({
      message,
    })
  }
}

// Exportación nombrada para resolver el error
