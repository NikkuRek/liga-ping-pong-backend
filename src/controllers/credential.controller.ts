import type { Request, Response } from "express"
import { CredentialServices } from "../services"

export class CredentialController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await CredentialServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CredentialServices.getOne(id)
    return res.status(status).json({
      message,
      data,
    })
  }

  byPlayerCI = async (req: Request, res: Response) => {
    const { player_ci } = req.params
    const { status, message, data } = await CredentialServices.getByPlayerCI(player_ci)
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await CredentialServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CredentialServices.update(id, req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  updateByPlayerCI = async (req: Request, res: Response) => {
    const { player_ci } = req.body
    const { status, message, data } = await CredentialServices.updateByPlayerCI(player_ci, req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await CredentialServices.delete(id)
    return res.status(status).json({
      message,
    })
  }

  authenticate = async (req: Request, res: Response) => {
    const { player_ci, password } = req.body
    const { status, message, data } = await CredentialServices.authenticate(player_ci, password)
    return res.status(status).json({
      message,
      data,
    })
  }
}
