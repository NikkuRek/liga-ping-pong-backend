import { Sequelize, type Dialect } from "sequelize"
import dotenv from "dotenv"

import {
  EntidadModel,
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

// Instanciamos el objeto Sequelize
// Configuración de la conexión a la base de datos
const db = new Sequelize(
  process.env.DATABASE_NAME || "database",
  process.env.DATABASE_USER || "user",
  process.env.DATABASE_PASSWORD || "password",
  {
    host: process.env.DATABASE_HOST || "localhost",
    dialect: (process.env.DATABASE_DIALECT as any) || "mysql",
    port: Number.parseInt(process.env.DATABASE_PORT || "3306"),
    logging: false,
  },
)

const Options = {
  timestamps: false, // Deshabilitar createdAt y updatedAt
}

// CREAMOS LAS TABLAS EN ORDEN ALFABETICO
const EntidadDB = db.define("entidad", EntidadModel, Options)

// En las relaciones importa el orden de la jerarquia




// Definición de modelos
//export const EntidadDB = db.define("Entidad", EntidadModel)

// Sincroniza los modelos con la base de datos
const syncModels = async () => {
  // Función para inicializar la base de datos
  try {
    await db.authenticate()
    console.log("Conexión a la base de datos establecida correctamente.")
    await db.sync({ alter: true })
    console.log("Base de datos sincronizada")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
  }
}

export const initDB = async () => {
  try {
    await db.authenticate()
    console.log("Conexión a la base de datos establecida correctamente.")
    await db.sync({ force: false })
    console.log("Base de datos sincronizada.")
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
  }
}

syncModels()

export {
  EntidadDB,
  db,
}

export default db
