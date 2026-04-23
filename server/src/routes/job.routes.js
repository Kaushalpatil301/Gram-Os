import { Router } from 'express';
import {
  createJob,
  getOpenJobs,
  getMyPostedJobs,
  getJob,
  applyForJob,
  updateApplicationStatus,
  closeJob,
  getWorkers,
} from '../controllers/job.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require auth
router.use(verifyJWT);

// Jobs
router.route('/').post(createJob).get(getOpenJobs);
router.route('/my-posted').get(getMyPostedJobs);
router.route('/workers').get(getWorkers);
router.route('/:id').get(getJob);
router.route('/:id/apply').post(applyForJob);
router.route('/:id/close').patch(closeJob);
router.route('/:jobId/applications/:appId').patch(updateApplicationStatus);

export default router;
