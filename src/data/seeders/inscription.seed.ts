import { InscriptionDB } from "../../config/sequelize.config";

export const inscriptionSeed = async () => {
    try {
        console.log("Iniciando seed de inscripciones...");
        const inscriptionsToCreate = [
            {
                CI: "29944901", // Debe existir en players
                id_tournament: 1, // Debe existir en tournament
                inscription_date: "2025-05-01",
                seed: null,
            },
            {
                CI: "29909792", // Debe existir en players
                id_tournament: 1, // Debe existir en tournament
                inscription_date: "2025-05-01",
                seed: null,
            },
            {
                CI: "30353315", // Debe existir en players
                id_tournament: 1, // Debe existir en tournament
                inscription_date: "2025-05-01",
                seed: null,
            },
            {
                CI: "31366298", // Debe existir en players
                id_tournament: 1, // Debe existir en tournament
                inscription_date: "2025-05-01",
                seed: null,
            },
            {
                CI: "31350493", // Debe existir en players
                id_tournament: 1, // Debe existir en tournament
                inscription_date: "2025-05-01",
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