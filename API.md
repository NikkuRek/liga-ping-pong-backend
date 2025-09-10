# API de Liga Ping Pong Backend

## Endpoints

### Salud

#### `GET /api/health`
Verifica el estado del servidor y la conexión a la base de datos.

**Respuesta:**
```json
{
    "status": "ok",
    "database": "connected"
}
```

---

### Carreras

#### `GET /api/career`
Lista todas las carreras.

#### `GET /api/career/:id`
Obtiene una carrera por ID.

#### `POST /api/career`
Crea una nueva carrera.

#### `PUT /api/career/:id`
Actualiza una carrera existente.

#### `DELETE /api/career/:id`
Elimina una carrera.

---

### Jugadores

#### `GET /api/player`
Lista todos los jugadores.

#### `GET /api/player/active`
Lista jugadores activos.

#### `GET /api/player/inactive`
Lista jugadores inactivos.

#### `GET /api/player/:ci`
Obtiene un jugador por CI.

#### `POST /api/player`
Crea un nuevo jugador.

#### `PUT /api/player/:ci`
Actualiza un jugador existente.

#### `DELETE /api/player/:ci`
Elimina lógicamente un jugador.

#### `DELETE /api/player/delete/:ci`
Elimina físicamente un jugador.

---

### Torneos

#### `GET /api/tournament`
Lista todos los torneos.

#### `GET /api/tournament/:id`
Obtiene un torneo por ID.

#### `POST /api/tournament`
Crea un nuevo torneo.

#### `PUT /api/tournament/:id`
Actualiza un torneo existente.

#### `DELETE /api/tournament/:id`
Elimina un torneo.

---

### Inscripciones

#### `GET /api/inscription`
Lista todas las inscripciones.

#### `GET /api/inscription/:id`
Obtiene una inscripción por ID.

#### `GET /api/inscription/player/:ci`
Obtiene inscripciones por jugador.

#### `GET /api/inscription/team/:teamId`
Obtiene inscripciones por equipo.

#### `GET /api/inscription/tournament/:tournamentId`
Obtiene inscripciones por torneo.

#### `POST /api/inscription`
Crea una nueva inscripción.

#### `PUT /api/inscription/:id`
Actualiza una inscripción existente.

#### `DELETE /api/inscription/:id`
Elimina una inscripción.

---

### Equipos

#### `GET /api/team`
Lista todos los equipos.

#### `GET /api/team/player/:ci`
Obtiene equipos por jugador.

#### `GET /api/team/:id`
Obtiene un equipo por ID.

#### `POST /api/team`
Crea un nuevo equipo.

#### `PUT /api/team/:id`
Actualiza un equipo existente.

#### `DELETE /api/team/:id`
Elimina un equipo.

---

### Partidos

#### `GET /api/match`
Lista todos los partidos.

#### `GET /api/match/:id`
Obtiene un partido por ID.

#### `GET /api/match/tournament/:id_tournament`
Obtiene partidos por torneo.

#### `POST /api/match`
Crea un nuevo partido.

#### `PUT /api/match/:id`
Actualiza un partido existente.

#### `PUT /api/match/:id/result`
Actualiza el resultado de un partido.

#### `DELETE /api/match/:id`
Elimina un partido.

---

### Sets

#### `GET /api/sets`
Lista todos los sets.

#### `GET /api/sets/:id`
Obtiene un set por ID.

#### `GET /api/sets/match/:matchId`
Obtiene sets por partido.

#### `POST /api/sets`
Crea un nuevo set.

#### `PUT /api/sets/:id`
Actualiza un set existente.

#### `DELETE /api/sets/:id`
Elimina un set.

---

### Registros de Aura (Aura Records)

#### `GET /api/aura-record`
Lista todos los registros de aura.

#### `GET /api/aura-record/:id`
Obtiene un registro de aura por ID.

#### `GET /api/aura-record/player/:ci`
Obtiene los registros de aura de un jugador.

#### `GET /api/aura-record/match/:matchId`
Obtiene los registros de aura de un partido.

#### `POST /api/aura-record`
Crea un nuevo registro de aura.

#### `PUT /api/aura-record/:id`
Actualiza un registro de aura.

#### `DELETE /api/aura-record/:id`
Elimina un registro de aura.

---

## Errores

Las respuestas de error siguen el formato:
```json
{
    "error": "Mensaje descriptivo del error"
}
```