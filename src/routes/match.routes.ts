import { Router } from "express";
import { validateFields } from "../middlewares";
import { MatchController } from "../controllers";
import { matchValidators } from "../validators";

const router = Router();
const matchController = new MatchController();

router.get("/", matchController.all); // http://localhost:3000/api/match
router.get("/:id", matchValidators.validateMatchIdExists, matchController.one);
router.get("/tournament/:id_tournament", matchController.all); // Assuming this fetches matches by tournament
router.post(
  "/",
  matchValidators.validateFields,
  matchValidators.validateTournamentAndTeamsExist,
  validateFields,
  matchController.create
);
router.put(
  "/:id",
  matchValidators.validateFields,
  matchValidators.validateMatchIdExists,
  matchValidators.validateTournamentAndTeamsExist,
  validateFields,
  matchController.update
);
router.put(
  "/:id/result",
  matchValidators.validateMatchIdExists,
  matchValidators.validateWinnerAndLoser,
  validateFields,
  matchController.update
);
router.delete("/:id", matchValidators.validateMatchIdExists, matchController.delete);

export const MatchRoute = router;

export default router;
