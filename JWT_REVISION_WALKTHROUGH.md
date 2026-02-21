# Auditoría y Mejoras del Sistema JWT - Liga Ping Pong

Este documento resume los cambios realizados en el sistema de autenticación de la API para mejorar la seguridad, el tipado y la organización del código.

## 1. Cambios Realizados y Justificación

### A. Exclusión de Contraseñas en la API
**Cambio:** Se modificó `src/services/credential.service.ts` para usar `{ attributes: { exclude: ["password"] } }` en todas las consultas de Sequelize.
**Justificación:** Seguridad básica (Principio de Menos Privilegio). Aunque la contraseña esté hasheada con `bcrypt`, enviarla al cliente es una vulnerabilidad innecesaria. El cliente nunca necesita el hash de la contraseña; solo necesita saber si el usuario es válido.

### B. Robustez en la Clave Secreta
**Cambio:** Se actualizó `src/helpers/jwt.helpers.ts` para buscar tanto `JWT_SECRET` como `PRIVATE_KEY` desde las variables de entorno.
**Justificación:** Compatibilidad y Consistencia. El archivo `.env.example` usaba `PRIVATE_KEY`, pero el código buscaba `JWT_SECRET`. Ahora el sistema es flexible y evita usar la "llave secreta por defecto" si alguna de las dos está configurada correctamente.

### C. Tipado Estricto de Request
**Cambio:** Se creó una interfaz `CustomRequest` que extiende `Request` de Express en `src/middlewares/validate-token.middlewares.ts`.
**Justificación:** Calidad de Código y Mantenibilidad. Evitar el uso de `any` permite que el compilador de TypeScript nos ayude a detectar errores. Ahora `req.player` está correctamente reconocido por el IDE en todos los controladores que usen este middleware.

### D. Protección de Endpoints de Credenciales
**Cambio:** Se aplicó `validateToken` a las rutas de `src/routes/credential.routes.ts` (exceptuando el login).
**Justificación:** Privacidad. Antes, cualquier persona podía listar todos los usuarios y sus CIs. Ahora, solo usuarios autenticados pueden ver o gestionar credenciales.

---

## 2. Mapa de Implementación JWT

### El flujo actual:
1.  **Login:** El usuario envía CI y contraseña a `/authenticate`.
2.  **Generación:** Si son correctos, `CredentialController` usa `createToken` para generar un JWT.
3.  **Uso:** El cliente envía el JWT en el header `Authorization: Bearer <token>`.
4.  **Validación:** El middleware `validateToken` intercepta la petición, verifica el token y carga los datos del jugador en `req.player`.
