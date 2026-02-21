import { HealthRoute } from "./health.routes"
import { Router } from "express"
import { CareerRoute } from "./career.routes"
import { CredentialRoute } from "./credential.routes"
import { PlayerRoute } from "./player.routes"
import { TournamentRoute } from "./tournament.routes"
import { InscriptionRoute } from "./inscription.routes"
import { MatchRoute } from "./match.routes"
import { SetsRoute } from "./sets.routes"
import { TeamRoute } from "./team.routes"
import { AuraRecordRoute } from "./aura_record.routes"

const router = Router()

// // Rutas de la API
// router.use("/career", CareerRoutes)

// export default router

export { AuraRecordRoute, CareerRoute, CredentialRoute, PlayerRoute, HealthRoute, TournamentRoute, InscriptionRoute,
     MatchRoute, SetsRoute, TeamRoute, router }
