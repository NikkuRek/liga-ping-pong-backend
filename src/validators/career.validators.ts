import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { CareerDB } from "../config/sequelize.config"

export class CareerValidator {
  validateFields = [
    check("name_career", "El nombre de la carrera es obligatorio").not().isEmpty(),
    check("name_career", "El nombre de la carrera debe ser una cadena de texto").isString(),
    check("name_career", "El nombre de la carrera debe contener solo letras, espacios y acentos").matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    ),
  ]

  validateNameExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nameCareerFromBody = req.body.name_career
      const idFromParams = req.params.id

      if (!nameCareerFromBody) {
        return next()
      }

      const existingCareer = await CareerDB.findOne({ where: { name_career: nameCareerFromBody } })

      if (existingCareer) {
        if (idFromParams) {
          const paramIdNum = Number.parseInt(idFromParams, 10)
          if (existingCareer.getDataValue("id") !== paramIdNum) {
            return res.status(400).json({
              message: `El nombre de carrera "${nameCareerFromBody}" ya está en uso.`,
            })
          } else {
            return next()
          }
        } else {
          return res.status(400).json({
            message: `El nombre de carrera "${nameCareerFromBody}" ya está registrado.`,
          })
        }
      } else {
        next()
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el nombre de la carrera",
      })
    }
  }

  validateIdExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idFromParams = req.params.id
      const idFromBody = req.body.id

      let idToCheck: number | undefined

      if (idFromParams) {
        idToCheck = Number.parseInt(idFromParams, 10)
      } else if (idFromBody !== undefined) {
        idToCheck = Number.parseInt(idFromBody, 10)
      } else {
        return next()
      }

      if (isNaN(idToCheck)) {
        return res.status(400).json({
          message: `El ID proporcionado "${idFromParams || idFromBody}" no es un número válido.`,
        })
      }

      const existingCareer = await CareerDB.findByPk(idToCheck)

      if (!existingCareer) {
        if (idFromParams) {
          return res.status(404).json({
            message: `Carrera con ID ${idToCheck} no encontrada.`,
          })
        } else {
          return next()
        }
      } else {
        if (idFromParams) {
          return next()
        } else {
          return res.status(400).json({
            message: `Encontrada la carrera con ID ${idToCheck}. Es un duplicado de otra carrera.`,
          })
        }
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar el ID de la carrera",
      })
    }
  }
}

export const careerValidators = new CareerValidator()
