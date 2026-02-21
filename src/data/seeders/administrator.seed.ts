import { AdministratorDB } from "../../config/sequelize.config";

export const administratorSeed = async () => {
  try {
    console.log("Iniciando seed de administradores...");
    
    // Hacemos admin a Gabriel Piña (CI: 29944901)
    const adminsToCreate = [
      {
        player_ci: "29944901",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    const createdAdmins = await AdministratorDB.bulkCreate(adminsToCreate);
    console.log(`Seed de administradores ejecutado correctamente. Insertados: ${createdAdmins.length}`);

  } catch (error) {
    console.error("Error al ejecutar seed de administradores:", error);
    throw error;
  }
};
