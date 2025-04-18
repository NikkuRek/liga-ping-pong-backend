import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import path from "path"
import { router } from "../routes/index.route"
import { setupSwagger } from "../config/swagger.config"

export class Server {
  private app: Application
  private port: string
  private apiPaths = {
    base: "/api",
  }

  constructor() {
    this.app = express()
    this.port = process.env.PORT || "3000"

    // Middlewares
    this.middlewares()

    // Rutas
    this.routes()

    // Swagger
    setupSwagger(this.app)
  }

  middlewares() {
    // CORS
    this.app.use(cors())

    // Lectura del body
    this.app.use(express.json())

    // Carpeta pública
    this.app.use(express.static(path.join(__dirname, "../public")))

    // Morgan para logs
    this.app.use(morgan("dev"))
  }

  routes() {
    this.app.use(this.apiPaths.base, router)
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en puerto ${this.port}`)
    })
  }
}
