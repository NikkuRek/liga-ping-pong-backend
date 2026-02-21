const port = process.env.PORT || "3004"
const apiUrl = process.env.API_URL || `http://localhost:${port}`
const pre = "/api"

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Liga de Ping Pong (LPP) API",
      version: "1.0.0",
      description: "API robusta para la gestión de la Liga de Ping Pong, incluyendo jugadores, torneos, equipos, inscripciones y cálculo de AURA.",
      contact: {
        name: "Soporte LPP",
        url: "https://github.com/NikkuRek",
      },
    },
    servers: [
      {
        url: `${apiUrl}${pre}`,
        description: "Servidor de Desarrollo",
      },
    ],
    tags: [
      { name: "Credential", description: "Autenticación y gestión de accesos" },
      { name: "Player", description: "Operaciones relacionadas con los jugadores" },
      { name: "Match", description: "Gestión de partidos y resultados" },
      { name: "Team", description: "Gestión de equipos (parejas)" },
      { name: "Inscription", description: "Inscripciones a torneos" },
      { name: "Tournament", description: "Gestión de competiciones" },
      { name: "AuraRecord", description: "Historial de cambios de AURA" },
      { name: "Career", description: "Gestión de carreras universitarias" },
      { name: "Sets", description: "Detalles de los sets por partido" },
      { name: "Health", description: "Estado de salud de la API" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/docs/*.yml", "./src/routes/*.ts"],
}

export { swaggerOptions }
