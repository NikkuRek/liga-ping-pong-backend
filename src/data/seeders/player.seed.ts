import { PlayerDB } from "../../config/sequelize.config";

export const playerSeed = async () => {
  try {
    console.log("Iniciando seed de jugadores...");
    const playersToCreate = [
      {
        CI: "29944901",
        first_name: "Gabriel",
        last_name: "Piña",
        phone: "04122886568",
        semester: 5,
        id_career: 1, // Asegúrate que esta carrera exista
        id_tier: 3,   // Asegúrate que este nivel exista
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        CI: "29909792",
        first_name: "Pedro",
        last_name: "Riera",
        phone: "04145121252", // Asegúrate que no haya espacios extra si phone es UNIQUE
        semester: 4,
        id_career: 1,
        id_tier: 3,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        CI: "30353315",
        first_name: "Luis",
        last_name: "Cala",
        phone: "04245170604",
        semester: 2,
        id_career: 1,
        id_tier: 2,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        CI: "31366298",
        first_name: "Edgar",
        last_name: "Briceño",
        phone: "04262498651",
        semester: 3,
        id_career: 1,
        id_tier: 2,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        CI: "31350493",
        first_name: "Samuel",
        last_name: "Rosales",
        phone: "04125120548",
        semester: 3,
        id_career: 1,
        id_tier: 2,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const createdPlayers = await PlayerDB.bulkCreate(playersToCreate);
    console.log(`Seed de jugadores ejecutado correctamente. Insertados: ${createdPlayers.length}`);

  } catch (error) {
    console.error("Error al ejecutar seed de jugadores:", error);
    throw error; // *** Re-lanzar el error ***
  }
};