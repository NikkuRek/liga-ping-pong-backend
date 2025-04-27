import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "../config";

import {
  CareerRoute,
  PlayerRoute,
  TierRoute,
} from "../routes/index.route";

import { db } from "../config/sequelize.config";

export class Server {
  private app: Application
  private port: string
  private apiurl: string
  private pre: string = "/api"
  private paths: any
  

  constructor() {
    this.app = express()
    this.port = process.env.PORT || "3000"
    this.apiurl = process.env.API_URL || `http://localhost:${this.port}`
    this.paths = {
      Career: this.pre + "/Career",
      Player: this.pre + "/Player",
      Tier: this.pre + "/Tier",
    };
    this.middlewares()
    this.routes()
    this.dbConnection();
    this.swaggerSetup();
  }

  middlewares() {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(express.static("src/public"))
    this.app.use(morgan("dev"))
  }

  routes() {
    this.app.use(this.paths.Career, CareerRoute);
    this.app.use(this.paths.Player, PlayerRoute);
    this.app.use(this.paths.Tier, TierRoute);
  }

  private async dbConnection() {
    try {
      await db.authenticate();
      console.log("Conexión exitosa a la base de datos...");
    } catch (error) {
      console.error("No se pudo conectar a la base de datos:", error);
    }
  }
  
  listen() {
    this.app.listen(this.port, () => {
      let URL = `${this.apiurl}/swagger/#`;
      console.log(`Servidor corriendo en ${URL}`);
    })
  }

  swaggerSetup() {
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

}
