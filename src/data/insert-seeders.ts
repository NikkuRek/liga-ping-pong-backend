import "dotenv/config";
import { db } from "../config";
import {
  careerSeed,
  entidadSeed,
  playerSeed
} from "../data/seeders";

export const insertSeeders = async () => {
  try {
    console.log("Iniciando inserción de datos de prueba...");
    await careerSeed();
    console.log("Seed de carreras ejecutado correctamente");
    await entidadSeed();
    console.log("Seed de entidades ejecutado correctamente");
    await playerSeed();
    console.log("Seed de jugadores ejecutado correctamente");
    console.log("Datos de prueba insertados correctamente");
  } catch (error) {
    console.error("Error al insertar datos de prueba:", error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log("Reseteando la base de datos...");
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.sync({ force: true });
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Base de datos reseteada correctamente");
  } catch (error) {
    console.error("Error al resetear la base de datos:", error);
    throw error;
  }
};

const runSeeders = async () => {
  try {
    console.log("Ejecutando seeders...");
    await db.authenticate();
    console.log("Conexión exitosa a la base de datos");

    await insertSeeders();
    console.log("Seeders ejecutados correctamente");

  } catch (error) {
    console.error("Error durante la ejecución de seeders:", error);

    throw error;
  }
};

const main = async () => {
  try {
    await resetDatabase();
    await runSeeders();

    console.log("Script de seeders finalizado con éxito.");
    process.exit(0);

  } catch (error) {
    console.error("El script de seeders falló:", error);
    process.exit(1);
  }
};

main();