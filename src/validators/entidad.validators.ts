import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { EntidadDB } from "../config/sequelize.config"

export class EntidadValidator {
  validateEntidad = [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("nombre", "El nombre debe ser una cadena de texto").isString(),
    check("descripcion", "La descripción debe ser una cadena de texto").optional().isString(),
    check("activo", "El estado debe ser un booleano").optional().isBoolean(),
  ]

  validateIfIdExist = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const entidad = await EntidadDB.findByPk(id)
    if (!entidad) {
      return res.status(404).json({
        message: "La entidad no existe",
      })
    }
    next()
  }

  validateIfNameIsUse = async (req: Request, res: Response, next: NextFunction) => {
    const { nombre } = req.body
    const { id } = req.params
    const entidad = await EntidadDB.findOne({ where: { nombre } })
    if (entidad && entidad.getDataValue("id").toString() !== id) {
      return res.status(400).json({
        message: "El nombre ya está en uso",
      })
    }
    next()
  }
}

// Exportación nombrada para resolver el error
export const entidadValidators = new EntidadValidator()
