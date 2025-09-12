import { InscriptionDB } from "../../config/sequelize.config";

export const inscriptionSeed = async () => {
    try {
        console.log("Iniciando seed de inscripciones...");
        const inscriptionsToCreate = [
            {
                player_ci: "29944901", // Debe existir en players
                tournament_id: 1,      // Debe existir en tournaments
                team_id: null,         // Solo para dobles, null aquí
                inscription_date: "2025-05-01 00:00:00",
                seed: null,
            },
            {
                player_ci: "29909792",
                tournament_id: 1,
                team_id: null,
                inscription_date: "2025-05-01 00:00:00",
                seed: null,
            },
            {
                player_ci: "30353315",
                tournament_id: 1,
                team_id: null,
                inscription_date: "2025-05-01 00:00:00",
                seed: null,
            },
            {
                player_ci: "31366298",
                tournament_id: 1,
                team_id: null,
                inscription_date: "2025-05-01 00:00:00",
                seed: null,
            },
            {
                player_ci: "31350493",
                tournament_id: 1,
                team_id: null,
                inscription_date: "2025-05-01 00:00:00",
                seed: null,
            },
        ];
        await InscriptionDB.bulkCreate(inscriptionsToCreate);
        console.log("Seed de inscripciones ejecutado correctamente");
    } catch (error) {
        console.error("Error al ejecutar seed de inscripciones:", error);
        throw error; 
    }
};