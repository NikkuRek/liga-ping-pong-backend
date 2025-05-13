import { HealthRoute } from "./health.routes"
import { Router } from "express"
import { CareerRoute } from "./career.routes"
import { PlayerRoute } from "./player.routes"
import { TierRoute } from "./tier.routes"
import { TournamentRoute } from "./tournament.routes"
import { InscriptionRoute } from "./inscription.routes"
import { TeamInscriptionRoute } from "./team-inscription.routes"
import { MatchRoute } from "./match.routes"
import { SetsRoute } from "./sets.routes"
import { TournamentPlayerStatsRoute } from "./tournament-player-stats.routes"
import { TeamRoute } from "./team.routes"

const router = Router()

// // Rutas de la API
// router.use("/career", CareerRoutes)

// export default router

export { CareerRoute, PlayerRoute, TierRoute, HealthRoute, TournamentRoute, InscriptionRoute, 
    TeamInscriptionRoute, MatchRoute, SetsRoute, TournamentPlayerStatsRoute, 
    TeamRoute, router  }
