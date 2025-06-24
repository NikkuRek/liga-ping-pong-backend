import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { PlayerDB } from "../config/sequelize.config"

export class PlayerValidator {
  validateFields = [
    check("playerData.ci", "El CI es obligatorio").not().isEmpty(),
    check("playerData.ci", "El CI debe contener solo números").isNumeric(),

    check("playerData.first_name", "El primer nombre es obligatorio").not().isEmpty(),
    check("playerData.first_name", "El primer nombre debe contener solo letras y letras con acentos")
      .isString()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),

    check("playerData.last_name", "El apellido es obligatorio").not().isEmpty(),
    check("playerData.last_name", "El apellido debe contener solo letras y letras con acentos")
      .isString()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),

    check("playerData.phone", "El teléfono es obligatorio").not().isEmpty(),
    check("playerData.phone", "El teléfono debe contener solo números").isNumeric(),

    check("playerData.semester", "El semestre es obligatorio").not().isEmpty(),
    check("playerData.semester", "El semestre debe ser un número entero").isInt(),

    check("playerData.career_id", "El id de la carrera es obligatorio").not().isEmpty(),
    check("playerData.career_id", "El id de la carrera debe ser un número").isNumeric(),

    check("playerData.tier_id", "El id del nivel es obligatorio").not().isEmpty(),
    check("playerData.tier_id", "El id del nivel debe ser un número").isNumeric(),

    check("playerData.status", "El estado debe ser un valor booleano").optional().isBoolean(),

    check("playerData.available_days", "La disponibilidad debe ser un array de IDs de días").optional().isArray(),
    check("playerData.available_days.*", "Cada día en la disponibilidad debe ser un número entero válido")
      .optional()
      .isInt({ min: 1, max: 5 }),
  ]

  validateCIExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ciFromBody = req.body.playerData?.ci
      const ciFromParams = req.params.ci

      if (!ciFromBody) {
        return next()
      }

      if (ciFromBody === ciFromParams) {
        return next()
      }

      const playerWithBodyCI = await PlayerDB.findOne({ where: { ci: ciFromBody } })

      if (playerWithBodyCI) {
        return res.status(400).json({
          message: `El CI "${ciFromBody}" ya está registrado por otro jugador.`,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar CI",
      })
    }
  }

  validatePhoneExists = async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body.playerData || {}
    const currentCI = req.params.ci

    if (!phone) {
      return next()
    }

    try {
      const player = await PlayerDB.findOne({ where: { phone: phone } })

      if (player) {
        if (currentCI && player.getDataValue("ci") === currentCI) {
          return next()
        } else {
          return res.status(400).json({
            message: "El teléfono ya está en uso por otro jugador",
          })
        }
      }
      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar teléfono",
      })
    }
  }
}

export const playerValidator = new PlayerValidator()
