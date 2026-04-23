import { Router } from 'express';
import { getBanks, requestLoan, simulateBankAction, getLoanRequests } from '../controllers/loan.controllers.js';

const router = Router();

router.route("/banks").get(getBanks);
router.route("/request").post(requestLoan);
router.route("/simulate-action").post(simulateBankAction); // Hidden endpoint to trigger banks' mock acceptance
router.route("/user-requests").get(getLoanRequests);

export default router;
