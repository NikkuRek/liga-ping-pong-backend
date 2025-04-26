import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TierDB } from "../config/sequelize.config"

export class TierValidator {
  validateTier = [
    check("range", "El nombre del nivel es obligatorio").not().isEmpty(),
    check("range", "El nombre del nivel debe ser una cadena de texto").isString(),
    check("range", "El nombre del nivel debe contener solo letras y espacios").matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  ]

  validateIfIdExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const tier = await TierDB.findByPk(id)
      if (!tier) {
        return res.status(404).json({
          message: "El nivel no existe",
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
      const { range } = req.body
      const { id } = req.params

      if (!range) {
        return next()
      }

      const tier = await TierDB.findOne({ where: { range } })

      if (tier && tier.getDataValue("id").toString() !== id) {
        return res.status(400).json({
          message: `El nombre del nivel "${range}" ya está en uso`,
        })
      }
      next()
    } catch (error) {
      console.error("Error en validateIfNameIsUse:", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar nombre del nivel",
      })
    }
  }
}

export const tierValidators = new TierValidator()
