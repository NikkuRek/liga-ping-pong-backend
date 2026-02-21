import { PlayerDB, DayDB } from "../config/sequelize.config"
import { ValidationError, IncludeOptions } from "sequelize"
import type { PlayerInterface } from "../interfaces"
import { InscriptionServices } from "./inscription.service"

class PlayerService {
  private readonly defaultIncludes: IncludeOptions[] = [
    {
      model: DayDB,
      as: 'Days'
    }
  ]

  async getAll() {
    try {
      const player = await PlayerDB.findAll({
        include: this.defaultIncludes
      })
      return {
        status: 200,
        message: "Jugadores obtenidos correctamente",
        data: player,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores",
        data: null,
      }
    }
  }

  async getOne(ci: string) {
    try {
      const player = await PlayerDB.findByPk(ci, {
        include: this.defaultIncludes
      });

      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        };
      }
      return {
        status: 200,
        message: "Jugador obtenido correctamente",
        data: player,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugador",
        data: null,
      };
    }
  }

  async getActive() {
    try {
      const activePlayers = await PlayerDB.findAll({
        where: { status: true },
        include: this.defaultIncludes
      });
      return {
        status: 200,
        message: "Jugadores activos obtenidos correctamente",
        data: activePlayers,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores activos",
        data: null,
      };
    }
  }

  async getInactive() {
    try {
      const inactivePlayers = await PlayerDB.findAll({
        where: { status: false },
        include: this.defaultIncludes
      });
      return {
        status: 200,
        message: "Jugadores inactivos obtenidos correctamente",
        data: inactivePlayers,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores inactivos",
        data: null,
      };
    }
  }

  async create(requestBody: { playerData: PlayerInterface, available_days: number[] }) {
    try {
      const { playerData, available_days } = requestBody;

      console.log("Service Create: Objeto completo recibido en el servicio:", requestBody); // Log del objeto completo
      console.log("Service Create: Datos de jugador (para crear registro):", playerData); // Log después de desestructurar (debería tener ci, nombre, etc.)
      console.log("Service Create: Datos de disponibilidad (array):", available_days); // Log después de desestructurar (debería ser el array [1, 3, 4])


      // 3. Crear el registro principal del jugador con los datos SIN la disponibilidad
      const newPlayer = await PlayerDB.create(playerData as any) as unknown as PlayerInterface;
      console.log("Service Create: Jugador principal creado exitosamente. ci:", newPlayer.ci);


      // 4. Manejar la disponibilidad si se proporcionó un array de IDs
      if (available_days && Array.isArray(available_days) && available_days.length > 0) {
        console.log("Service Create: Procesando disponibilidad para IDs:", available_days);

        // Buscar las instancias de DayDB
        const dayInstances = await DayDB.findAll({
          where: { day_id: available_days } // Cambiado de 'id' a 'day_id'
        });
        console.log("Service Create: Instancias de DayDB encontradas:", dayInstances.map(d => d.get()));

        // Usar el método de asociación addDays
        console.log("Service Create: Añadiendo asociación de días...")
        await (newPlayer as any).addDays(dayInstances);
        console.log("Service Create: Asociación de días añadida exitosamente.");

      } else {
        console.log("Service Create: No se proporcionaron datos de disponibilidad válidos.");
      }

      if (newPlayer) {
        const currentDate = new Date();
        const inscription1 = {
          player_ci: newPlayer.ci,
          tournament_id: 1,
          team_id: null,
          seed: 0,
          inscription_date: currentDate,
        };
        const inscription2 = {
          player_ci: newPlayer.ci,
          tournament_id: 2,
          team_id: null,
          seed: 0,
          inscription_date: currentDate,
        };
        await InscriptionServices.create(inscription1 as any);
        await InscriptionServices.create(inscription2 as any);
      }

      console.log("Service Create: Lógica de creación y disponibilidad completada.");

      return {
        status: 201,
        message: "Jugador creado correctamente",
        data: newPlayer, // Podrías volver a buscarlo con include si quieres la disponibilidad en la respuesta
      };
    } catch (error) {
      console.error("Error al crear jugador (servicio create):", error);
      if ((error as any).parent) {
        console.error("Detalles del error SQL/DB:", (error as any).parent);
        console.error("Sentencia SQL:", (error as any).sql);
      }
      // Log errores de validación de Sequelize más detalladamente
      if (error instanceof ValidationError) {
        console.error("Errores de validación de Sequelize:", error.errors.map(err => err.message));
      }


      return {
        status: 500,
        message: "Error al crear jugador",
        data: null,
      };
    }
  }

  async update(ci: string, updateDataWithAvailability: { playerData?: Partial<PlayerInterface>, available_days?: number[] }) { // Modificado el tipo de entrada
    try {
      const existingPlayer = await PlayerDB.findByPk(ci);
      if (!existingPlayer) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        };
      }
      const { playerData, available_days } = updateDataWithAvailability;
      if (playerData) {
        await existingPlayer.update(playerData);
      }

      if (updateDataWithAvailability.hasOwnProperty('available_days')) {
        if (Array.isArray(available_days)) {
          const dayInstances = await DayDB.findAll({
            where: { day_id: available_days }
          });

          await (existingPlayer as any).setDays(dayInstances);

        } else {
          console.warn(`Datos de disponibilidad enviados no son un array para jugador ${ci}. No se actualizará la disponibilidad.`);
        }
      }
      const updatedPlayer = await PlayerDB.findByPk(ci, {
        include: {
          model: DayDB,
          as: 'Days'
        }
      });

      return {
        status: 200,
        message: "Jugador actualizado correctamente",
        data: updatedPlayer,
      };
    } catch (error) {
      console.error("Error al actualizar jugador (servicio update):", error);
      return {
        status: 500,
        message: "Error al actualizar jugador",
        data: null,
      };
    }
  }

  async softDelete(ci: string) {
    try {
      const player = await PlayerDB.findByPk(ci);
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
        };
      }
      await player.update({ status: false });
      return {
        status: 200,
        message: "Jugador deshabilitado correctamente",
      };
    } catch (error) {
      console.error("Error al deshabilitar jugador (servicio):", error);
      return {
        status: 500,
        message: "Error al deshabilitar jugador",
      };
    }
  }

  async delete(ci: string) {
    try {
      const player = await PlayerDB.findByPk(ci);
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
        };
      }
      await player.destroy();
      return {
        status: 200,
        message: "Jugador eliminado correctamente",
      };
    } catch (error) {
      console.error("Error al eliminar jugador (servicio):", error);
      return {
        status: 500,
        message: "Error al eliminar jugador",
      };
    }
  }

  async patch(ci: string, playerData: Partial<PlayerInterface>) {
    try {
      const player = await PlayerDB.findByPk(ci);
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }

      const { createdAt, updatedAt, ci: _, ...dataToUpdate } = playerData as any;
      await PlayerDB.update(dataToUpdate, { where: { ci } });
      
      const updatedPlayer = await PlayerDB.findByPk(ci, {
        include: this.defaultIncludes
      });

      return {
        status: 200,
        message: "Jugador actualizado parcialmente",
        data: updatedPlayer,
      }
    } catch (error) {
      console.error("Error al actualizar parcialmente jugador:", error);
      return {
        status: 500,
        message: "Error al actualizar parcialmente jugador",
        data: null,
      }
    }
  }
}

export const PlayerServices = new PlayerService();
