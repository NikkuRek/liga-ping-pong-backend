import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerOptions } from "../config"

import { CareerRoute, PlayerRoute, TierRoute, HealthRoute, TournamentRoute, TeamRoute,
  InscriptionRoute, MatchRoute, SetsRoute,
  } from "../routes/index.route"

export class Server {
  private app: Application
  private port: string
  private apiurl: string
  private pre = "/api"
  private paths: any

  constructor() {
    this.app = express()
    this.port = process.env.PORT || "3000"
    this.apiurl = process.env.API_URL || `http://localhost:${this.port}`
    this.paths = {
      careers: this.pre + "/careers",
      players: this.pre + "/players",
      tiers: this.pre + "/tiers",
      health: this.pre + "/health",
      tournaments: this.pre + "/tournaments",
      teams: this.pre + "/teams",
      inscriptions: this.pre + "/inscriptions",
      matches: this.pre + "/matches",
      sets: this.pre + "/sets",
    }
    this.middlewares()
    this.routes()
    this.swaggerSetup()
  }

  middlewares() {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(express.static("src/public"))
    this.app.use(morgan("dev"))
  }

  routes() {
    this.app.use(this.paths.careers, CareerRoute)
    this.app.use(this.paths.players, PlayerRoute)
    this.app.use(this.paths.tiers, TierRoute)
    this.app.use(this.paths.health, HealthRoute)
    this.app.use(this.paths.tournaments, TournamentRoute)
    this.app.use(this.paths.teams, TeamRoute)
    this.app.use(this.paths.inscriptions, InscriptionRoute)
    this.app.use(this.paths.matches, MatchRoute)
    this.app.use(this.paths.sets, SetsRoute)
  }

  listen() {
    this.app.listen(this.port, () => {
      const URL = `${this.apiurl}/swagger/#`
      console.log(`Servidor corriendo en ${URL}`)
    })
  }

  swaggerSetup() {
    const swaggerDocs = swaggerJsDoc(swaggerOptions)
    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
  }
}
