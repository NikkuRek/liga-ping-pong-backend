import { PlayerDB, DayDB } from "../config/sequelize.config"
import { ValidationError } from "sequelize";
import type { PlayerInterface } from "../interfaces"

// Define la interfaz para el OBJETO COMPLETO que viene en el body
// con la propiedad 'playerData' y 'available_days' a nivel RAÍZ
interface CreateRequestBody {
  playerData: PlayerInterface; // 'playerData' contiene los campos del jugador (sin available_days anidado aquí)
  available_days?: number[]; // 'available_days' es un array de IDs de días a nivel RAÍZ
}

interface PlayerUpdateData extends Partial<PlayerInterface> {
  available_days?: number[]; // Para la actualización, también esperamos available_days a nivel raíz
}

class PlayerService {
  async getAll() {
    try {
      const player = await PlayerDB.findAll({ include: DayDB })
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

  async getOne(CI: string) {
    try {
      // Incluir la disponibilidad en la respuesta usando el alias de asociación 'Days'
      // Si definiste un alias diferente con 'as' en tu belongsToMany, usa ese alias aquí.
      const player = await PlayerDB.findByPk(CI, {
        include: {
          model: DayDB, // El modelo a incluir
          as: 'Days', // *** Usa el alias de asociación correcto (por defecto es 'Days') ***
          through: { attributes: [] } // Opcional: No incluir los campos de la tabla intermedia (createdAt, updatedAt, etc.)
        }
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
      const activePlayers = await PlayerDB.findAll({ where: { status: true }, include: DayDB });
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
      const inactivePlayers = await PlayerDB.findAll({ where: { status: false }, include: DayDB });
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

  // *** Lógica de CREACIÓN con Disponibilidad (CORREGIDA para payload raíz) ***
  // La función ahora espera el OBJETO COMPLETO del body con 'playerData' y 'available_days' a nivel raíz
  async create(requestBody: CreateRequestBody) { // <-- Usar la interfaz CreateRequestBody definida arriba
    try {
      // *** CORREGIDO: Desestructurar playerData y available_days directamente del objeto recibido ***
      const { playerData, available_days } = requestBody; // <-- Desestructurar a nivel raíz

      console.log("Service Create: Objeto completo recibido en el servicio:", requestBody); // Log del objeto completo
      console.log("Service Create: Datos de jugador (para crear registro):", playerData); // Log de playerData
      console.log("Service Create: Datos de disponibilidad (array):", available_days); // Log de available_days

      // 2. Crear el registro principal del jugador con los datos de playerData
      // Asegúrate de que playerData contiene todos los campos NOT NULL (CI, first_name, etc.)
      const newPlayer = await PlayerDB.create(playerData as any) as unknown as PlayerInterface;
      console.log("Service Create: Jugador principal creado exitosamente. CI:", newPlayer.CI);


      // 3. Manejar la disponibilidad si se proporcionó un array de IDs
      // available_days ahora es el array que viene a nivel raíz
      if (available_days && Array.isArray(available_days) && available_days.length > 0) {
        console.log("Service Create: Procesando disponibilidad para IDs:", available_days);

        // Buscar las instancias de DayDB
        // *** VERIFICA AQUÍ EL NOMBRE DE LA CLAVE PRIMARIA DE TU DayDB (id o id_day) ***
        console.log("Service Create: Buscando instancias de DayDB con IDs:", available_days);
        const dayInstances = await DayDB.findAll({
          where: { id_day: available_days } // <-- Usa 'id_day' si esa es la PK en tu tabla days
          // where: { id: available_days } // <-- Usa 'id' si esa es la PK en tu tabla days
        });
        console.log("Service Create: Instancias de DayDB encontradas:", dayInstances.map(d => d.get()));

        // Usar el método de asociación addDays para vincular el nuevo jugador con los días.
        // Sequelize insertará las filas correspondientes en la tabla AvailabilityDB.
        console.log("Service Create: Añadiendo asociación de días...");
        // Asegúrate de que newPlayer tiene el método addDays disponible (tipado o asercion)
        await (newPlayer as any).addDays(dayInstances); // addDays uses the association alias internally
        console.log("Service Create: Asociación de días añadida exitosamente.");

      } else {
        console.log("Service Create: No se proporcionaron datos de disponibilidad válidos.");
      }

      console.log("Service Create: Lógica de creación y disponibilidad completada.");

      return {
        status: 201,
        message: "Jugador creado correctamente",
        data: newPlayer, // Por defecto, retorna la instancia sin los días incluidos. Si quieres incluirlos, refetch con include.
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

  async update(CI: string, updateDataWithAvailability: PlayerUpdateData) {
    try {
      const existingPlayer = await PlayerDB.findByPk(CI);
      if (!existingPlayer) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        };
      }
      const { available_days, ...playerDataToUpdate } = updateDataWithAvailability;
      await existingPlayer.update(playerDataToUpdate);
      if (updateDataWithAvailability.hasOwnProperty('available_days')) {
        if (Array.isArray(available_days)) {
          const dayInstances = await DayDB.findAll({
            where: { id_day: available_days }
          });

          await (existingPlayer as any).setDays(dayInstances);

        } else {
          console.warn(`Datos de disponibilidad enviados no son un array para jugador ${CI}. No se actualizará la disponibilidad.`);
        }
      }
      const updatedPlayer = await PlayerDB.findByPk(CI, { include: DayDB });

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

  async softDelete(CI: string) {
    try {
      const player = await PlayerDB.findByPk(CI);
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

  async delete(CI: string) {
    try {
      const player = await PlayerDB.findByPk(CI);
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
}

export const PlayerServices = new PlayerService();