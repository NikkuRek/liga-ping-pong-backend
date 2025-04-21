import { CareerDB } from "../config/sequelize.config"
import type { CareerInterface } from "../interfaces"

class CareerService {
  async getAll() {
    try {
      const career = await CareerDB.findAll()
      return {
        status: 200,
        message: "Carreras obtenidas correctamente",
        data: career,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener carreras",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const career = await CareerDB.findByPk(id)
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
      const newCareer = await CareerDB.create(career as any)
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

  async update(id: number, career: CareerInterface) {
    try {
      const existingCareer = await CareerDB.findByPk(id)
      if (!existingCareer) {
        return {
          status: 404,
          message: "Carrera no encontrada",
          data: null,
        }
      }
      await CareerDB.update(career, { where: { id } })
      const updatedCareer = await CareerDB.findByPk(id)
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

  async delete(id: number) {
    try {
      const career = await CareerDB.findByPk(id)
      if (!career) {
        return {
          status: 404,
          message: "Carrera no encontrada",
        }
      }
      await CareerDB.destroy({ where: { id } })
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
