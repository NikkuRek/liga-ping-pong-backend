import { EntidadDB } from "../config/sequelize.config"
import type { EntidadInterface } from "../interfaces"

class EntidadService {
  async getAll() {
    try {
      const entidades = await EntidadDB.findAll()
      return {
        status: 200,
        message: "Entidades obtenidas correctamente",
        data: entidades,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener entidades",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const entidad = await EntidadDB.findByPk(id)
      if (!entidad) {
        return {
          status: 404,
          message: "Entidad no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Entidad obtenida correctamente",
        data: entidad,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener entidad",
        data: null,
      }
    }
  }

  async create(entidad: EntidadInterface) {
    try {
      const newEntidad = await EntidadDB.create(entidad as any)
      return {
        status: 201,
        message: "Entidad creada correctamente",
        data: newEntidad,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear entidad",
        data: null,
      }
    }
  }

  async update(id: number, entidad: EntidadInterface) {
    try {
      const existingEntidad = await EntidadDB.findByPk(id)
      if (!existingEntidad) {
        return {
          status: 404,
          message: "Entidad no encontrada",
          data: null,
        }
      }
      await EntidadDB.update(entidad, { where: { id } })
      const updatedEntidad = await EntidadDB.findByPk(id)
      return {
        status: 200,
        message: "Entidad actualizada correctamente",
        data: updatedEntidad,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar entidad",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const entidad = await EntidadDB.findByPk(id)
      if (!entidad) {
        return {
          status: 404,
          message: "Entidad no encontrada",
        }
      }
      await EntidadDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Entidad eliminada correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar entidad",
      }
    }
  }
}

export const EntidadServices = new EntidadService()
