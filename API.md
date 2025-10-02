# API de Liga Ping Pong Backend

Este documento describe los endpoints de la API, generados a partir de la especificación Swagger/OpenAPI.

## Health

*   `GET /api/health` - Verifica el estado de la aplicación.

## Aura Records

*   `GET /api/aura_record` - Obtiene todos los registros de aura.
*   `POST /api/aura_record` - Crea un nuevo registro de aura.
*   `GET /api/aura_record/{id}` - Obtiene un registro de aura por ID.
*   `PUT /api/aura_record/{id}` - Actualiza un registro de aura.
*   `DELETE /api/aura_record/{id}` - Elimina un registro de aura.
*   `GET /api/aura_record/player/{ci}` - Obtiene registros de aura por jugador.
*   `GET /api/aura_record/match/{matchId}` - Obtiene registros de aura por partido.

## Careers

*   `GET /api/career` - Obtiene todas las carreras.
*   `POST /api/career` - Crea una nueva carrera.
*   `GET /api/career/{career_id}` - Obtiene una carrera por id.
*   `PUT /api/career/{career_id}` - Actualiza una carrera.
*   `DELETE /api/career/{career_id}` - Elimina una carrera.

## Credentials

*   `GET /api/credential` - Obtiene todas las credenciales.
*   `POST /api/credential` - Crea una nueva credencial.
*   `PUT /api/credential` - Actualiza una credencial por CI del jugador.
*   `GET /api/credential/{id}` - Obtiene una credencial por ID.
*   `PUT /api/credential/{id}` - Actualiza una credencial por ID.
*   `DELETE /api/credential/{id}` - Elimina una credencial.
*   `GET /api/credential/player/{player_ci}` - Obtiene credencial por CI de jugador.
*   `POST /api/credential/authenticate` - Autentica credenciales de un jugador.

## Inscriptions

*   `GET /api/inscription` - Obtiene todas las inscripciones.
*   `POST /api/inscription` - Crea una nueva inscripción.
*   `GET /api/inscription/{id}` - Obtiene una inscripción por ID.
*   `PUT /api/inscription/{id}` - Actualiza una inscripción.
*   `DELETE /api/inscription/{id}` - Elimina una inscripción.
*   `GET /api/inscription/tournament/{id}` - Obtiene inscripciones por torneo.
*   `GET /api/inscription/player/{ci}` - Obtiene inscripciones por jugador.
*   `GET /api/inscription/team/{id}` - Obtiene inscripciones por equipo.

## Matches

*   `GET /api/match` - Obtiene todos los partidos.
*   `POST /api/match` - Crea un nuevo partido.
*   `GET /api/match/{id}` - Obtiene un partido por ID.
*   `PUT /api/match/{id}` - Actualiza un partido.
*   `DELETE /api/match/{id}` - Elimina un partido.
*   `PUT /api/match/{id}/result` - Actualiza el resultado de un partido.
*   `GET /api/match/tournament/{id_tournament}` - Obtiene partidos por torneo.

## Players

*   `GET /api/player` - Obtiene todos los jugadores.
*   `POST /api/player` - Crea un nuevo jugador.
*   `GET /api/player/active` - Obtiene jugadores activos.
*   `GET /api/player/inactive` - Obtiene jugadores inactivos.
*   `GET /api/player/{ci}` - Obtiene un jugador por CI.
*   `PUT /api/player/{ci}` - Actualiza un jugador.
*   `DELETE /api/player/{ci}` - Deshabilita un jugador (borrado lógico).
*   `DELETE /api/player/delete/{ci}` - Elimina físicamente un jugador.

## Sets

*   `GET /api/set` - Obtiene todos los sets.
*   `POST /api/set` - Crea un nuevo set.
*   `GET /api/set/{id}` - Obtiene un set por ID.
*   `PUT /api/set/{id}` - Actualiza un set.
*   `DELETE /api/set/{id}` - Elimina un set.
*   `GET /api/set/match/{id}` - Obtiene sets por partido.

## Teams

*   `GET /api/team` - Obtiene todos los equipos.
*   `POST /api/team` - Crea un nuevo equipo.
*   `GET /api/team/{id}` - Obtiene un equipo por ID.
*   `PUT /api/team/{id}` - Actualiza un equipo.
*   `DELETE /api/team/{id}` - Elimina un equipo.
*   `GET /api/team/player/{ci}` - Obtiene equipos por jugador.

## Tournaments

*   `GET /api/tournament` - Obtiene todos los torneos.
*   `POST /api/tournament` - Crea un nuevo torneo.
*   `GET /api/tournament/{id}` - Obtiene un torneo por ID.
*   `PUT /api/tournament/{id}` - Actualiza un torneo.
*   `DELETE /api/tournament/{id}` - Elimina un torneo.

---

## Formato de Errores

Las respuestas de error generalmente siguen este formato:

```json
{
    "ok": false,
    "error": "Mensaje descriptivo del error"
}
```

O en el caso de los servicios que retornan un objeto con `status`, `message` y `data`:

```json
{
    "status": 500,
    "message": "Mensaje descriptivo del error",
    "data": null
}
```