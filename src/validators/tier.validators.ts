import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { TierDB } from "../config/sequelize.config"

export class TierValidator {
  validateFields = [
    check("range", "El nombre del nivel es obligatorio").not().isEmpty(),
    check("range", "El nombre del nivel debe ser una cadena de texto").isString(),
    check("range", "El nombre del nivel debe contener solo letras, espacios y acentos").matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    ),
  ]

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id
      const idFromBody = req.body.id_tier

      console.log("--- validateIdExists (Tier) Debug ---")
      console.log("ID desde Params:", `'${idFromParams}'`, typeof idFromParams)
      console.log("ID desde Body:", `'${idFromBody}'`, typeof idFromBody)

      let idToCheck: number | undefined

      if (idFromParams) {
        idToCheck = Number.parseInt(idFromParams, 10)
        console.log(`validateIdExists (Tier): Verificando ID desde params: ${idToCheck}`)
      } else if (idFromBody !== undefined) {
        idToCheck = Number.parseInt(idFromBody, 10)
        console.log(`validateIdExists (Tier): Verificando ID desde body: ${idToCheck}`)
      } else {
        console.log("validateIdExists (Tier): No hay ID para verificar, pasando...")
        return next()
      }

      if (isNaN(idToCheck)) {
        console.log(`validateIdExists (Tier): ID proporcionado "${idFromParams || idFromBody}" no es un número válido.`)
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams || idFromBody}" no es un número válido.`,
        })
      }

      const existingTier = await TierDB.findByPk(idToCheck)

      if (!existingTier) {
        if (idFromParams) {
          console.log(`validateIdExists (Tier): Nivel con ID ${idToCheck} no encontrado (desde params).`)
          return res.status(404).json({
            message: `Nivel con ID ${idToCheck} no encontrado.`,
          })
        } else {
          console.log(
            `validateIdExists (Tier): Nivel con ID ${idToCheck} no encontrado (desde body). El ID es único para creación. Pasando.`,
          )
          return next()
        }
      } else {
        if (idFromParams) {
          console.log(`validateIdExists (Tier): Nivel con ID ${idToCheck} encontrado (desde params). Pasando.`)
          return next()
        } else {
          console.log(
            `validateIdExists (Tier): Nivel con ID ${idToCheck} encontrado (desde body). Es un duplicado para creación.`,
          )
          return res.status(400).json({
            message: `Encontrado el nivel con ID ${idToCheck}. Es un duplicado de otro nivel.`,
          })
        }
      }
    } catch (error) {
      console.error("Error en validateIdExists (Tier):", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID del nivel",
      })
    }
  }

  validateNameExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rangeFromBody = req.body.range
      const idFromParams = req.params.id

      console.log("--- validateNameExists (Tier) Debug ---")
      console.log("Nombre de Nivel desde Body:", `'${rangeFromBody}'`, typeof rangeFromBody)
      console.log("ID desde Params (en validateNameExists):", `'${idFromParams}'`, typeof idFromParams)

      if (!rangeFromBody) {
        console.log("validateNameExists (Tier): Nombre de nivel del body no encontrado o vacío, pasando...")
        return next()
      }

      const existingTier = await TierDB.findOne({ where: { range: rangeFromBody } })

      if (existingTier) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingTier.getDataValue("id_tier") !== paramIdNum) {
            console.log(
              `validateNameExists (Tier): Nombre de nivel "${rangeFromBody}" ya está en uso por otro nivel (ID: ${existingTier.getDataValue("id_tier")}).`,
            )
            return res.status(400).json({
              message: `El nombre del nivel "${rangeFromBody}" ya está en uso.`,
            })
          } else {
            console.log(
              `validateNameExists (Tier): Nombre de nivel "${rangeFromBody}" pertenece al nivel actual (ID: ${idFromParams}), pasando.`,
            )
            return next()
          }
        } else {
          console.log(`validateNameExists (Tier): Nombre de nivel "${rangeFromBody}" ya existe en la base de datos.`)
          return res.status(400).json({
            message: `El nombre del nivel "${rangeFromBody}" ya está registrado.`,
          })
        }
      } else {
        console.log(`validateNameExists (Tier): Nombre de nivel "${rangeFromBody}" no encontrado en DB, pasando.`)
        next()
      }
    } catch (error) {
      console.error("Error en validateNameExists (Tier):", error)
      return res.status(500).json({
        message: "Error interno del servidor al validar el nombre del nivel",
      })
    }
  }
}

export const tierValidators = new TierValidator()
