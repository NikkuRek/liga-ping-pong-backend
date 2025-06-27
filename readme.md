# Liga Ping Pong Backend

Backend API para gestionar una liga de Ping Pong, construido con Node.js y Express.

## Características

- Registro y gestión de jugadores
- Programación de partidos y seguimiento de resultados
- Clasificación y estadísticas de la liga
- Endpoints RESTful

## Stack Tecnológico

- Node.js
- Express
- MySQL (usando el paquete ORM Sequelize)
- Autenticación JWT (En proceso)

## Primeros Pasos

### Requisitos Previos

- Node.js (v18+)
- MySQL

### Instalación

```bash
git clone https://github.com/NikkuRek/liga-ping-pong-backend.git
cd liga-ping-pong-backend
npm install
```

### Variables de Entorno

Crea un archivo `.env` con el siguiente contenido:

```env
DATABASE_PORT=3000
API_URL=
DATABASE_DIALECT=mysql
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=[inserta tu contraseña aquí]
DATABASE_NAME=LPP_DB
DEV=true
```

### Ejecutar el Servidor

Puedes ejecutar el servidor en diferentes modos según los scripts definidos en `package.json`:

### Comandos Disponibles

- **npm run build**  
    Compila el código TypeScript a JavaScript en la carpeta `dist`.

- **npm run start**  
    Inicia el servidor en modo producción usando el código compilado en `dist`.

- **npm run dev**  
    Compila el código e inicia el servidor en modo desarrollo.

- **npm run seeds**  
    Ejecuta los scripts en la carpeta `dist` para poblar la base de datos con datos de ejemplo (semillas).

- **npm run seeds-build**  
    Compila y ejecuta los scripts para poblar la base de datos.

- **npm run seeds-dev**
    Compila, ejecuta los scripts para poblar la base de datos y arranca el servidor.

Puedes usar estos comandos según el entorno y la necesidad de tu desarrollo.

## Documentación de la API

Consulta [API.md](API.md) para la documentación detallada de los endpoints.

## Licencia

[MIT](LICENSE)