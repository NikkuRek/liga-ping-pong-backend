import { CareerDB } from "../config/sequelize.config"
import type { CareerInterface } from "../interfaces"

class CareerService {
  async getAll() {
    try {
      const careers = await CareerDB.findAll()
      return {
        status: 200,
        message: "Carreras obtenidas correctamente",
        data: careers,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener carreras",
        data: null,
      }
    }
  }

  async getOne(career_id: number) {
    try {
      const career = await CareerDB.findByPk(career_id)
      if (!career) {
        return {
          status: 404,
          message: "Carrera no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Carrera obtenida correctamente",
        data: career,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener carrera",
        data: null,
      }
    }
  }

  async create(career: CareerInterface) {
    try {
      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, career_id, ...careerData } = career
      const newCareer = await CareerDB.create(careerData as any)
      return {
        status: 201,
        message: "Carrera creada correctamente",
        data: newCareer,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear carrera",
        data: null,
      }
    }
  }

  async update(career_id: number, career: CareerInterface) {
    try {
      const existingCareer = await CareerDB.findByPk(career_id)
      if (!existingCareer) {
        return {
          status: 404,
          message: "Carrera no encontrada",
          data: null,
        }
      }
      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, career_id: _, ...careerData } = career
      await CareerDB.update(careerData, { where: { career_id } })
      const updatedCareer = await CareerDB.findByPk(career_id)
      return {
        status: 200,
        message: "Carrera actualizada correctamente",
        data: updatedCareer,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar carrera",
        data: null,
      }
    }
  }

  async delete(career_id: number) {
    try {
      const career = await CareerDB.findByPk(career_id)
      if (!career) {
        return {
          status: 404,
          message: "Carrera no encontrada",
        }
      }
      await CareerDB.destroy({ where: { career_id } })
      return {
        status: 200,
        message: "Carrera eliminada correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar carrera",
      }
    }
  }
}

export const CareerServices = new CareerService()
