import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerOptions } from "../config"

import { CareerRoute, PlayerRoute, TierRoute, HealthRoute, TournamentRoute, TeamRoute,
  InscriptionRoute, TeamInscriptionRoute, MatchRoute, SetsRoute, TournamentPlayerStatsRoute,
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
      Career: this.pre + "/Career",
      Player: this.pre + "/Player",
      Tier: this.pre + "/Tier",
      Health: this.pre + "/Health",
      Tournament: this.pre + "/Tournament",
      Team: this.pre + "/Team",
      Inscription: this.pre + "/Inscription",
      TeamInscription: this.pre + "/TeamInscription",
      Match: this.pre + "/Match",
      Sets: this.pre + "/Sets",
      TournamentPlayerStats: this.pre + "/TournamentPlayerStats",
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
    this.app.use(this.paths.Career, CareerRoute)
    this.app.use(this.paths.Player, PlayerRoute)
    this.app.use(this.paths.Tier, TierRoute)
    this.app.use(this.paths.Health, HealthRoute)
    this.app.use(this.paths.Tournament, TournamentRoute)
    this.app.use(this.paths.Team, TeamRoute)
    this.app.use(this.paths.Inscription, InscriptionRoute)
    this.app.use(this.paths.TeamInscription, TeamInscriptionRoute)
    this.app.use(this.paths.Match, MatchRoute)
    this.app.use(this.paths.Sets, SetsRoute)
    this.app.use(this.paths.TournamentPlayerStats, TournamentPlayerStatsRoute)
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
