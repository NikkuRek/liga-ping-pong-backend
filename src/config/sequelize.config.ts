import { Sequelize, type Dialect } from "sequelize"
import dotenv from "dotenv"

import {
  EntidadModel,
  CareerModel,
} from "../models"

dotenv.config()

const dbName: string = process.env.DATABASE_NAME!
const dbUser: string = process.env.DATABASE_USER!
const dbPassword: string = process.env.DATABASE_PASSWORD!
const dbDialect: Dialect = process.env.DATABASE_DIALECT! as Dialect
const dbHost: string = process.env.DATABASE_HOST!
const dbPort: number = Number(process.env.DATABASE_PORT)

const sequelizeOptions: any = {
  dialect: dbDialect,
  host: dbHost,
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// Si el host no es localhost, agrega el puerto a las opciones
if (dbHost !== "localhost") {
  sequelizeOptions.port = dbPort
}

// Configuración de la conexión a la base de datos
export const db = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

const Options = {
  timestamps: false, // Deshabilitar createdAt y updatedAt
}

// CREAMOS LAS TABLAS EN ORDEN ALFABETICO
export const CareerDB = db.define("career", CareerModel)
export const EntidadDB = db.define("entidad", EntidadModel, Options)

// En las relaciones importa el orden de la jerarquia

// PlayerDB
// CareerDB.hasMany(PlayerDB, { foreignKey: "id_career" });
// PlayerDB.belongsTo(CareerDB, { foreignKey: "id_career" });

// Sincroniza los modelos con la base de datos
const syncModels = async () => {
  try {
    await db.authenticate()
    console.log("Conectando a la base de datos...")
    await db.sync({ alter: true })
    console.log("Base de datos sincronizada")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
  }
}

syncModels()

export default db
