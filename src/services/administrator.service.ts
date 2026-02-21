import { AdministratorDB, PlayerDB } from "../config/sequelize.config"

class AdministratorService {
  async isAdmin(player_ci: string): Promise<boolean> {
    try {
      const admin = await AdministratorDB.findOne({
        where: { player_ci }
      });
      return !!admin;
    } catch (error) {
      console.error(`Error verificando admin para ${player_ci}:`, error);
      return false;
    }
  }

  async getAll() {
    try {
      const admins = await AdministratorDB.findAll({
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"]
        }
      });
      return {
        status: 200,
        message: "Administradores obtenidos correctamente",
        data: admins,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener administradores",
        data: null,
      };
    }
  }

  async add(player_ci: string) {
    try {
      const existing = await AdministratorDB.findOne({ where: { player_ci } });
      if (existing) {
        return { status: 400, message: "El jugador ya es administrador" };
      }
      const newAdmin = await AdministratorDB.create({ player_ci });
      return {
        status: 201,
        message: "Administrador añadido correctamente",
        data: newAdmin,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al añadir administrador",
        data: null,
      };
    }
  }

  async remove(player_ci: string) {
    try {
      const result = await AdministratorDB.destroy({ where: { player_ci } });
      if (result === 0) {
        return { status: 404, message: "Administrador no encontrado" };
      }
      return {
        status: 200,
        message: "Privilegios de administrador removidos",
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error al remover administrador",
      };
    }
  }
}

export const AdministratorServices = new AdministratorService();
