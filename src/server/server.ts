import express, { type Application } from "express"
import { createServer } from "http"
import { Server as SocketServer } from "socket.io"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerOptions } from "../config"
import { verifyToken } from "../helpers/jwt.helpers"
import { MatchServices, InscriptionServices } from "../services"

import {
  AuraRecordRoute,
  CareerRoute,
  PlayerRoute,
  HealthRoute,
  TournamentRoute,
  TeamRoute,
  InscriptionRoute,
  MatchRoute,
  SetsRoute,
  CredentialRoute,
} from "../routes/index.route"

export class Server {
  private app: Application
  private server: any
  private io: SocketServer
  private port: string
  private apiurl: string
  private pre = "/api"
  private paths: any

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.io = new SocketServer(this.server, {
      cors: {
        origin: "*", // Adjust for production
      },
    })
    ;(global as any).io = this.io
    this.port = process.env.PORT || "3004"
    this.apiurl = process.env.API_URL || `http://localhost:${this.port}`
    this.paths = {
      aura_records: this.pre + "/aura_record",
      careers: this.pre + "/career",
      players: this.pre + "/player",
      health: this.pre + "/health",
      tournaments: this.pre + "/tournament",
      teams: this.pre + "/team",
      inscriptions: this.pre + "/inscription",
      matches: this.pre + "/match",
      sets: this.pre + "/set",
      credentials: this.pre + "/credential",
    }
    this.middlewares()
    this.routes()
    this.swaggerSetup()
    this.socketSetup()
  }

  middlewares() {
    this.app.use(cors({
      origin: true,
      credentials: true
    }))
    this.app.use(express.json())
    this.app.use(cookieParser())
    this.app.use(express.static("src/public"))
    this.app.use(morgan("dev"))
  }

  routes() {
    this.app.use(this.paths.aura_records, AuraRecordRoute)
    this.app.use(this.paths.careers, CareerRoute)
    this.app.use(this.paths.players, PlayerRoute)
    this.app.use(this.paths.health, HealthRoute)
    this.app.use(this.paths.tournaments, TournamentRoute)
    this.app.use(this.paths.teams, TeamRoute)
    this.app.use(this.paths.inscriptions, InscriptionRoute)
    this.app.use(this.paths.matches, MatchRoute)
    this.app.use(this.paths.sets, SetsRoute)
    this.app.use(this.paths.credentials, CredentialRoute)
  }

  listen() {
    this.server.listen(this.port, () => {
      const URL = `${this.apiurl}/swagger/#`
      console.log(`Servidor corriendo en ${URL}`)
    })
  }

  swaggerSetup() {
    const swaggerDocs = swaggerJsDoc(swaggerOptions)
    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
  }

  socketSetup() {
    this.io.on('connection', (socket) => {
      console.log('Usuario conectado:', socket.id)

      // JWT auth
      let token = socket.handshake.auth?.token;

      // Si no hay token en auth, buscar en cookies del header
      if (!token && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(/token=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) {
        socket.disconnect()
        return
      }
      const decoded: any = verifyToken(token)
      if (!decoded || !decoded.ci) {
        socket.disconnect()
        return
      }
      (socket as any).playerCI = decoded.ci
      socket.join(decoded.ci)

      // Handle match events
      socket.on('approveMatch', async (data) => {
        const { matchId } = data
        // Get match
        const match = await MatchServices.getOne(matchId)
        if (match.status !== 200 || (match.data as any).status !== 'Propuesto') return
        // Check if socket.playerCI is one of the players
        const inscription1 = await InscriptionServices.getOne((match.data as any).inscription1_id)
        const inscription2 = await InscriptionServices.getOne((match.data as any).inscription2_id)
        const player1CI = (inscription1.data as any)?.player_ci
        const player2CI = (inscription2.data as any)?.player_ci
        if ((socket as any).playerCI !== player1CI && (socket as any).playerCI !== player2CI) return
        const proposerCI = (socket as any).playerCI === player1CI ? player2CI : player1CI
        // Update status to 'Pendiente'
        const current = match.data as any
        await MatchServices.update(matchId, { ...current.dataValues, status: 'Pendiente' } as any)
        // Create sets? Assume 3 sets or something, but for now, skip, as per user, create sets later
        // Emit to proposer
        this.io.to(proposerCI).emit('matchApproved', { matchId })
      })

      socket.on('rejectMatch', async (data) => {
        const { matchId } = data
        // Similar checks
        const match = await require('../services').MatchServices.getOne(matchId)
        if (match.status !== 200 || (match.data as any).status !== 'Propuesto') return
        const inscription1 = await InscriptionServices.getOne((match.data as any).inscription1_id)
        const inscription2 = await InscriptionServices.getOne((match.data as any).inscription2_id)
        const player1CI = (inscription1.data as any)?.player_ci
        const player2CI = (inscription2.data as any)?.player_ci
        if ((socket as any).playerCI !== player1CI && (socket as any).playerCI !== player2CI) return
        const proposerCI = (socket as any).playerCI === player1CI ? player2CI : player1CI
        // Delete match
        await MatchServices.delete(matchId)
        // Emit to proposer
        this.io.to(proposerCI).emit('matchRejected', { matchId })
      })

      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id)
      })
    })
  }
}
