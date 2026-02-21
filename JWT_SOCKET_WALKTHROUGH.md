# Walkthrough: Integración de JWT y Sockets en Liga Ping Pong Backend

Este documento explica detalladamente los cambios implementados para integrar autenticación JWT y compatibilidad con sockets en tiempo real para el flujo de partidos en el backend de Liga Ping Pong.

## Introducción

Se implementaron las siguientes funcionalidades:
- **Autenticación JWT**: Login seguro que genera tokens, middleware para proteger rutas, y verificación de tokens.
- **Sockets en tiempo real**: Propuesta, aprobación y rechazo de partidos vía WebSockets, con autenticación JWT en conexiones.
- **Flujo de partidos**: Un jugador propone un partido, el oponente lo aprueba/rechaza, y se crea el partido completo automáticamente.

## 1. Integración de JWT

### 1.1 Helpers de JWT (`src/helpers/jwt.helpers.ts`)
- **Cambios**: Se activaron las funciones `createToken` y `verifyToken`.
- **createToken**: Genera un JWT con payload `{ ci: player.ci }`, expiración de 1 hora, usando `JWT_SECRET` o "mediplus" como clave.
- **verifyToken**: Verifica el token y retorna el payload decodificado o `{}` si inválido.
- **Importancia**: Centraliza la lógica de tokens para reutilización.

### 1.2 Controlador de Credenciales (`src/controllers/credential.controller.ts`)
- **Cambios en `authenticate`**:
  - Ahora genera un token JWT tras verificar credenciales.
  - Respuesta: `{ message, token, user }` en lugar de solo datos.
- **Importancia**: El login ahora proporciona un token para autenticación en rutas protegidas.

### 1.3 Middleware de Validación de Token (`src/middlewares/validate-token.middlewares.ts`)
- **Funcionalidad**:
  - Verifica header `Authorization: Bearer <token>`.
  - Decodifica y valida el token.
  - Busca al jugador por CI y verifica status.
  - Adjunta `req.player` con datos del usuario.
- **Errores**: 401 para token requerido, inválido, o usuario deshabilitado.
- **Importancia**: Protege rutas sensibles sin repetir lógica.

### 1.4 Rutas Protegidas (`src/routes/match.routes.ts`)
- **Cambios**: Agregado `validateToken` a:
  - `POST /match` (crear partido)
  - `PUT /match/{id}` (actualizar)
  - `PUT /match/{id}/result` (actualizar resultado)
  - `DELETE /match/{id}` y `/match/{id}/cascade`
- **Nueva ruta**: `POST /match/propose` para proponer partidos (requiere token).
- **Importancia**: Solo usuarios autenticados pueden gestionar partidos.

### 1.5 Endpoint de Verificación (`src/routes/health.routes.ts`)
- **Nueva ruta**: `GET /health/token` con `validateToken`.
- **Respuesta**: `{ status: "valid", user: {...} }` si token válido.
- **Importancia**: Permite verificar estado de tokens sin afectar datos.

## 2. Integración de Sockets

### 2.1 Instalación y Configuración
- **Dependencias**: Instalado `socket.io` y `@types/socket.io`.
- **Servidor (`src/server/server.ts`)**:
  - Integrado `http.Server` y `SocketServer`.
  - Conexiones autenticadas con JWT en handshake.
  - Usuarios unen rooms por CI para notificaciones dirigidas.

### 2.2 Modelo de Partidos (`src/models/match.model.ts`)
- **Cambio**: Agregado `'Propuesto'` al enum de `status`.
- **Estados**: 'Pendiente', 'En Juego', 'Finalizado', 'Cancelado', 'Propuesto'.
- **Importancia**: Permite distinguir partidos propuestos de confirmados.

### 2.3 Servicio de Partidos (`src/services/match.service.ts`)
- **Nuevo método `propose`**:
  - Crea partido con `status: 'Propuesto'`.
  - Similar a `create`, pero marca como propuesto.
- **Importancia**: Lógica backend para propuestas.

### 2.4 Controlador de Partidos (`src/controllers/match.controller.ts`)
- **Nuevo método `propose`**:
  - Llama a `MatchServices.propose`.
  - Emite `matchProposed` al oponente vía socket.
  - Determina oponente por inscripciones.
- **Importancia**: Endpoint para iniciar propuestas.

### 2.5 Eventos de Socket (`src/server/server.ts`)
- **Conexión**:
  - Valida token JWT.
  - Une socket a room por CI.
- **Eventos**:
  - `approveMatch`: Cambia status a 'Pendiente', emite `matchApproved`.
  - `rejectMatch`: Elimina partido, emite `matchRejected`.
- **Validaciones**: Solo participantes pueden aprobar/rechazar.
- **Importancia**: Manejo en tiempo real de decisiones.

## 3. Documentación de Swagger

### 3.1 Configuración Global (`src/config/swagger.config.ts`)
- **Agregado**: `securitySchemes` para Bearer JWT.

### 3.2 Documentos YAML
- **`credential.doc.yml`**: Actualizada respuesta de authenticate con `token` y `user`.
- **`match.doc.yml`**: Agregado security a rutas protegidas, nueva ruta `/propose`.
- **`health.doc.yml`**: Nueva ruta `/token` para verificación.

## 4. Cómo Probar

### 4.1 Autenticación JWT
1. Login: `POST /api/credential/authenticate` con CI y password.
2. Copia el `token`.
3. Verifica: `GET /api/health/token` con `Authorization: Bearer <token>`.

### 4.2 Sockets
1. Conecta con `socket.io-client` usando auth: `{ token }`.
2. Propone: `POST /api/match/propose` con datos de partido.
3. Oponente recibe `matchProposed`, responde con `approveMatch` o `rejectMatch`.

### 4.3 En Swagger
- Autoriza con `Bearer <token>`.
- Prueba rutas protegidas.

## Conclusión

Estos cambios proporcionan un sistema seguro y en tiempo real para gestión de partidos. JWT asegura autenticación, mientras que sockets permiten interacciones dinámicas. La documentación está actualizada para facilitar el desarrollo frontend.

Para más detalles, revisa los archivos modificados o contacta al equipo.</content>
<parameter name="filePath">c:\Users\Usuario\Documents\dev\liga-ping-pong-backend\JWT_SOCKET_WALKTHROUGH.md