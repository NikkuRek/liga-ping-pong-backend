import { Router } from "express";
import { validateFields, matchLimiter, validateToken } from "../middlewares";
import { MatchController } from "../controllers";
import { matchValidators } from "../validators";

const router = Router();
const matchController = new MatchController();

router.get("/", matchController.all); // http://localhost:3004/api/match
router.get("/player/:player_ci", matchController.getMatchesByPlayerCI); // http://localhost:3004/api/match/player/:player_ci
router.get("/player/:player_ci/current-week-matches", matchController.getMatchesByCIInCurrentWeek);
router.get("/:id", matchValidators.validateMatchIdExists, matchController.one);
router.get("/tournament/:id_tournament", matchController.all); // Assuming this fetches matches by tournament
router.get("/player/name", matchController.getMatchesByPlayerName); // http://localhost:3004/api/match/player/name?first_name=&last_name=
router.post(
  "/",
  validateToken,
  matchValidators.validateFields,
  matchValidators.validateTournamentAndInscriptionsExist,
  validateFields,
  matchLimiter,
  matchController.create
);
router.post(
  "/propose",
  validateToken,
  matchValidators.validateFields,
  matchValidators.validateTournamentAndInscriptionsExist,
  validateFields,
  matchController.propose
);
router.put(
  "/:id",
  validateToken,
  matchValidators.validateFields,
  matchValidators.validateMatchIdExists,
  matchValidators.validateTournamentAndInscriptionsExist,
  validateFields,
  matchController.update
);
router.put(
  "/:id/result",
  validateToken,
  matchValidators.validateMatchIdExists,
  matchValidators.validateWinnerInscription,
  validateFields,
  matchController.update
);
router.delete("/:id", validateToken, matchValidators.validateMatchIdExists, matchController.delete);
router.delete(
  "/:id/cascade",
  validateToken,
  matchValidators.validateMatchIdExists,
  //  middleware to check if the match exists
  matchController.deleteCascade
);

export const MatchRoute = router;

export default router;
