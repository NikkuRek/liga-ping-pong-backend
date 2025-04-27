const port = process.env.DATABASE_PORT!;
const apiUrl = process.env.API_URL || `http://localhost:${port}`;
const pre = "/api";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API LPP",
      version: "1.0.0",
      description: "Documentación de la API de la LPP",
    },
    servers: [
      {
        url: `${apiUrl}${pre}`,
      },
    ],
  },
  basePath: '/api',
  apis: ["./src/docs/*.yml", "./src/routes/*.ts"]
};

export { swaggerOptions }