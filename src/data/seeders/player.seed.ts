import { PlayerDB } from "../../config/sequelize.config";

export const playerSeed = async () => {
  try {
    console.log("Iniciando seed de jugadores...");
    const playersToCreate = [
      {
        ci: "29944901",
        first_name: "Gabriel",
        last_name: "Piña",
        phone: "04122886568",
        semester: 5,
        career_id: 1, 
        aura: 1300,  
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ci: "29909792",
        first_name: "Pedro",
        last_name: "Riera",
        phone: "04145121252", 
        semester: 4,
        career_id: 1,
        aura: 1300,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ci: "30353315",
        first_name: "Luis",
        last_name: "Cala",
        phone: "04245170604",
        semester: 2,
        career_id: 1,
        aura: 1300,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ci: "31366298",
        first_name: "Edgar",
        last_name: "Briceño",
        phone: "04262498651",
        semester: 3,
        career_id: 1,
        aura: 1200,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ci: "31350493",
        first_name: "Samuel",
        last_name: "Rosales",
        phone: "04125120548",
        semester: 3,
        career_id: 1,
        aura: 1200,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const createdPlayers = await PlayerDB.bulkCreate(playersToCreate);
    console.log(`Seed de jugadores ejecutado correctamente. Insertados: ${createdPlayers.length}`);

  } catch (error) {
    console.error("Error al ejecutar seed de jugadores:", error);
    throw error;
  }
};