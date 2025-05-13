import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { PlayerDB } from "../config/sequelize.config"

export class PlayerValidator {
  validateFields = [
    check("playerData.CI", "El CI es obligatorio").not().isEmpty(),
    check("playerData.CI", "El CI debe contener solo números").isNumeric(),

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

    check("playerData.id_career", "El id de la carrera es obligatorio").not().isEmpty(),
    check("playerData.id_career", "El id de la carrera debe ser un número").isNumeric(),

    check("playerData.id_tier", "El id del nivel es obligatorio").not().isEmpty(),
    check("playerData.id_tier", "El id del nivel debe ser un número").isNumeric(),

    check("playerData.status", "El estado debe ser un valor booleano").optional().isBoolean(),

    check("playerData.available_days", "La disponibilidad debe ser un array de IDs de días").optional().isArray(),
    check("playerData.available_days.*", "Cada día en la disponibilidad debe ser un número entero válido")
      .optional()
      .isInt({ gt: 0, lt: 6 }),
  ]

  validateCIExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ciFromBody = req.body.playerData?.CI
      const ciFromParams = req.params.CI

      console.log("--- validateCIExists Debug ---")
      console.log("CI desde Body:", `'${ciFromBody}'`, typeof ciFromBody)
      console.log("CI desde Params:", `'${ciFromParams}'`, typeof ciFromParams)
      console.log("Comparación ciFromBody === ciFromParams:", ciFromBody === ciFromParams)
      if (!ciFromBody) {
        console.log("CI del body no encontrado o vacío en, pasando...")
        return next()
      }

      if (ciFromBody === ciFromParams) {
        console.log("CI del body coincide con CI de params, pasando...")
        return next()
      }

      console.log("CI del body es diferente al de params, buscando en DB...")
      const playerWithBodyCI = await PlayerDB.findOne({ where: { CI: ciFromBody } })

      if (playerWithBodyCI) {
        console.log("Encontrado jugador con CI del body. Es un duplicado de otro jugador.")
        return res.status(400).json({
          message: `El CI "${ciFromBody}" ya está registrado por otro jugador.`,
        })
      }

      console.log("CI del body es diferente al de params y no encontrado en DB. Pasando...")
      next()
    } catch (error) {
      console.error("Error en validateCIExists:", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar CI",
      })
    }
  }

  validatePhoneExists = async (req: Request, res: Response, next: NextFunction) => {
    const { phone, CI } = req.body.playerData || {}
    const currentCI = req.params.CI

    if (!phone) {
      console.warn("No se proporcionó teléfono en. Saltando validación de teléfono en uso.")
      return next()
    }

    try {
      const player = await PlayerDB.findOne({ where: { phone: phone } })

      if (player) {
        if (currentCI && player.getDataValue("CI") === currentCI) {
          console.log(`Teléfono ${phone} pertenece al jugador actual ${currentCI}, pasando.`)
          return next()
        } else {
          console.log(`Teléfono ${phone} ya está en uso por otro jugador (CI: ${player.getDataValue("CI")}).`)
          return res.status(400).json({
            message: "El teléfono ya está en uso por otro jugador",
          })
        }
      }
      console.log(`Teléfono ${phone} no encontrado en DB, pasando.`)
      next()
    } catch (error) {
      console.error("Error en validatePhoneExists:", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar teléfono",
      })
    }
  }
}

export const playerValidator = new PlayerValidator()
