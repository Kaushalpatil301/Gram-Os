import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getProfileByUser,
  listUsersByRole,
} from '../controllers/profile.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected — requires login
router.route('/me').get(verifyJWT, getMyProfile);
router.route('/me').put(verifyJWT, updateMyProfile);

// Public lookups
router.route('/users/:role').get(listUsersByRole);
router.route('/:role/:userId').get(getProfileByUser);

export default router;
