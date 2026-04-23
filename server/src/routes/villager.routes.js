import { Router } from "express";
import { getSchemes, getNptelCourses, getSkillModules } from "../controllers/villager.controllers.js";

const router = Router();

router.route("/schemes").get(getSchemes);
router.route("/courses").get(getNptelCourses);
router.route("/modules").get(getSkillModules);

export default router;
