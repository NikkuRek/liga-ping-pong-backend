import { Router } from "express";
import { validateFields } from "../middlewares";
import { MatchController } from "../controllers";
import { matchValidators } from "../validators";

const router = Router();
const matchController = new MatchController();

router.get("/", matchController.all); // http://localhost:3004/api/match
router.get("/player/:player_ci", matchController.getMatchesByPlayerCI); // http://localhost:3004/api/match/player/:player_ci
router.get("/:id", matchValidators.validateMatchIdExists, matchController.one);
router.get("/tournament/:id_tournament", matchController.all); // Assuming this fetches matches by tournament
router.post(
  "/",
  matchValidators.validateFields,
  matchValidators.validateTournamentAndInscriptionsExist,
  validateFields,
  matchController.create
);
router.put(
  "/:id",
  matchValidators.validateFields,
  matchValidators.validateMatchIdExists,
  matchValidators.validateTournamentAndInscriptionsExist,
  validateFields,
  matchController.update
);
router.put(
  "/:id/result",
  matchValidators.validateMatchIdExists,
  matchValidators.validateWinnerInscription,
  validateFields,
  matchController.update
);
router.delete("/:id", matchValidators.validateMatchIdExists, matchController.delete);
router.delete(
  "/:id/cascade",
  matchValidators.validateMatchIdExists,
  //  middleware to check if the match exists
  matchController.deleteCascade
);

export const MatchRoute = router;

export default router;
