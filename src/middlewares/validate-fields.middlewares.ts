import type { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

export const validateFields = (req: Request, res: Response, next: NextFunction) => {
  console.log("--- Ejecutando validateFields ---")
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Errores de validación encontrados:", errors.array())
    return res.status(400).json(errors)
  }
  console.log("No hay errores de validación.")

  next()
}
