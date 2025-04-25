import { AvailabilityDB } from "../../config/sequelize.config"; 

export const availabilitySeed = async () => {
    try {
        console.log("Iniciando seed de disponibilidad...");

        const availabilityData = [

            { CI: "29944901", id_day: 3 },

            { CI: "29909792", id_day: 2 },
            { CI: "29909792", id_day: 3 },
            { CI: "29909792", id_day: 4 },
            { CI: "29909792", id_day: 5 },

            { CI: "30353315", id_day: 1 },
            { CI: "30353315", id_day: 2 },
            { CI: "30353315", id_day: 4 },
            { CI: "30353315", id_day: 5 },

            { CI: "31366298", id_day: 2 },
            { CI: "31366298", id_day: 4 },
        ];

        await AvailabilityDB.bulkCreate(availabilityData);

        console.log("Seed de disponibilidad ejecutado correctamente");

    } catch (error) {
        console.error("Error al ejecutar seed de disponibilidad", error);
    }
};