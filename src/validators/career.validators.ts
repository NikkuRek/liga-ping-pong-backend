import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { CareerDB } from "../config/sequelize.config"

export class CareerValidator {
  validateCareer = [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("nombre", "El nombre debe ser una cadena de texto").isString(),
  ]

  validateIfIdExist = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const career = await CareerDB.findByPk(id)
    if (!career) {
      return res.status(404).json({
        message: "La carrera no existe",
      })
    }
    next()
  }

  validateIfNameIsUse = async (req: Request, res: Response, next: NextFunction) => {
    const { nombre } = req.body
    const { id } = req.params
    const career = await CareerDB.findOne({ where: { nombre } })
    if (career && career.getDataValue("id").toString() !== id) {
      return res.status(400).json({
        message: "El nombre ya está en uso",
      })
    }
    next()
  }
}

export const careerValidators = new CareerValidator()
