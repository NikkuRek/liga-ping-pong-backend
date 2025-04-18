import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Express } from "express"

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API REST",
      version: "1.0.0",
      description: "Documentación de la API REST",
    },
    servers: [
      {
        url: "http://localhost:3900",
        description: "Servidor de desarrollo",
      },
    ],
  },
  apis: ["./src/docs/*.yml", "./src/routes/*.ts"],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

// Función para configurar Swagger en la aplicación
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  console.log("Documentación de Swagger disponible en /api-docs")
}
