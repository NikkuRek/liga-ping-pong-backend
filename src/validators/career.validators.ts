import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { CareerDB } from "../config/sequelize.config"

export class CareerValidator {
  validateCareer = [
    check("name_career", "El nombre de la carrera es obligatorio").not().isEmpty(),
    check("name_career", "El nombre de la carrera debe ser una cadena de texto").isString(),
    check("name_career", "El nombre de la carrera debe contener solo letras y espacios").matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  ]

  validateIfIdExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const career = await CareerDB.findByPk(id)
      if (!career) {
        return res.status(404).json({
          message: "La carrera no existe",
        })
      }
      next()
    } catch (error) {
      console.error("Error en validateIfIdExist:", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar ID",
      })
    }
  }

  validateIfNameIsUse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name_career } = req.body
      const { id } = req.params

      if (!name_career) {
        return next()
      }

      const career = await CareerDB.findOne({ where: { name_career } })

      if (career && career.getDataValue("id").toString() !== id) {
        return res.status(400).json({
          message: `El nombre de la carrera "${name_career}" ya está en uso`,
        })
      }
      next()
    } catch (error) {
      console.error("Error en validateIfNameIsUse:", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar nombre de la carrera",
      })
    }
  }
}

export const careerValidators = new CareerValidator()
