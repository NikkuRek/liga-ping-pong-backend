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
import { MatchServices, InscriptionServices, PlayerServices, AdministratorServices } from "../services"

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

      // Handle result consensus events
      socket.on('approveResult', async (data) => {
        const { matchId } = data
        const matchResponse = await MatchServices.getOne(matchId)
        if (matchResponse.status !== 200) return
        
        const match = matchResponse.data as any
        if (match.status !== 'Propuesto') return

        // Obtener jugador del socket para verificar si es admin
        const playerResponse = await PlayerServices.getOne((socket as any).playerCI)
        const isAdmin = (playerResponse.data as any)?.is_admin || false

        const inscription1 = await InscriptionServices.getOne(match.inscription1_id)
        const inscription2 = await InscriptionServices.getOne(match.inscription2_id)
        const player1CI = (inscription1.data as any)?.player_ci
        const player2CI = (inscription2.data as any)?.player_ci

        // Si no es admin, validar que sea uno de los jugadores
        if (!isAdmin && (socket as any).playerCI !== player1CI && (socket as any).playerCI !== player2CI) return
        
        // Notificar al proponente (si existe)
        const proposerCI = (socket as any).playerCI === player1CI ? player2CI : player1CI

        // Actualizar estado a 'Finalizado' -> Esto disparará el AURA en el servicio
        await MatchServices.update(matchId, { ...match.dataValues, status: 'Finalizado' } as any, isAdmin)
        
        this.io.to(player1CI).to(player2CI).emit('matchFinalized', { matchId, approvedBy: (socket as any).playerCI })
        console.log(`[SOCKET] Resultado ${matchId} aprobado por ${(socket as any).playerCI} (Admin: ${isAdmin})`)
      })

      socket.on('rejectResult', async (data) => {
        console.log(`[SOCKET_DEBUG - Server] Received 'rejectResult' from ${socket.id}`, data)
        const { matchId, reason } = data
        
        // El motivo de rechazo es obligatorio
        if (!reason || reason.trim() === '') {
          console.log(`[SOCKET_DEBUG - Server] Reject failed: Reason is missing`)
          socket.emit('error', { message: 'El motivo de rechazo es obligatorio' })
          return
        }

        const matchResponse = await MatchServices.getOne(matchId)
        if (matchResponse.status !== 200) {
           console.log(`[SOCKET_DEBUG - Server] Reject failed: Match ${matchId} not found`)
           return
        }
        
        const match = matchResponse.data as any
        if (match.status !== 'Propuesto') {
           console.log(`[SOCKET_DEBUG - Server] Reject failed: Match ${matchId} is not 'Propuesto'`)
           return
        }

        const inscription1 = await InscriptionServices.getOne(match.inscription1_id)
        const inscription2 = await InscriptionServices.getOne(match.inscription2_id)
        const player1CI = (inscription1.data as any)?.player_ci
        const player2CI = (inscription2.data as any)?.player_ci

        console.log(`[SOCKET_DEBUG - Server] P1_CI: ${player1CI}, P2_CI: ${player2CI}, Caller_CI: ${(socket as any).playerCI}`)

        // NO actualizamos Base de Datos para mantener el estado "Propuesto" oficial.
        // Toda la lógica de Rechazo es una capa visual manejada vía Caché y Sockets.
        
        // Notificar al proponente
        console.log(`[SOCKET_DEBUG - Server] Emitting 'matchRejected' to ${player1CI} & ${player2CI}`)
        this.io.to(player1CI).to(player2CI).emit('matchRejected', { matchId, rejectedBy: (socket as any).playerCI, reason })
        console.log(`[SOCKET] Resultado ${matchId} rechazado por ${(socket as any).playerCI}. Motivo: ${reason}`)
      })

      socket.on('reproposeResult', async (data) => {
        console.log(`[SOCKET_DEBUG - Server] Received 'reproposeResult' from ${socket.id}`, data)
        const { matchId } = data
        const matchResponse = await MatchServices.getOne(matchId)
        if (matchResponse.status !== 200) return
        
        const match = matchResponse.data as any
        const inscription1 = await InscriptionServices.getOne(match.inscription1_id)
        const inscription2 = await InscriptionServices.getOne(match.inscription2_id)
        const player1CI = (inscription1.data as any)?.player_ci
        const player2CI = (inscription2.data as any)?.player_ci

        // Notificar al oponente
        const opponentCI = (socket as any).playerCI === player1CI ? player2CI : player1CI
        console.log(`[SOCKET_DEBUG - Server] Emitting 'matchReproposed' to Opponent CI: ${opponentCI}`)
        
        this.io.to(opponentCI).emit('matchReproposed', { matchId, reproposedBy: (socket as any).playerCI })
        console.log(`[SOCKET] Resultado ${matchId} re-propuesto por ${(socket as any).playerCI}`)
      })

      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id)
      })
    })
  }
}
