import { Job } from '../models/job.models.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── POST a new job (farmer / retailer only) ──────────────────────────────────
export const createJob = asyncHandler(async (req, res) => {
  const { title, description, type, skills, location, pay, workers, duration } = req.body;
  if (!title || !type || !pay) throw new ApiError(400, 'title, type and pay are required');

  const job = await Job.create({
    postedBy: req.user._id,
    title, description, type,
    skills: skills || [],
    location, pay,
    workers: workers || 1,
    duration,
  });

  res.status(201).json(new ApiResponse(201, job, 'Job posted successfully'));
});

// ─── GET all open jobs (villager browsing) ───────────────────────────────────
export const getOpenJobs = asyncHandler(async (req, res) => {
  const { search, type } = req.query;
  const query = { status: 'open' };
  if (type) query.type = new RegExp(type, 'i');
  if (search) query.$or = [
    { title: new RegExp(search, 'i') },
    { description: new RegExp(search, 'i') },
    { type: new RegExp(search, 'i') },
  ];

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .populate('postedBy', 'username role avatar')
    .lean();

  // Count applicants without exposing all application details to workers
  const safeJobs = jobs.map(j => ({ ...j, applicationCount: j.applications.length, applications: undefined }));
  res.json(new ApiResponse(200, safeJobs, 'Jobs fetched'));
});

// ─── GET jobs posted by current user (farmer / retailer dashboard) ────────────
export const getMyPostedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate('applications.applicant', 'username role avatar')
    .lean();
  res.json(new ApiResponse(200, jobs, 'Your posted jobs'));
});

// ─── GET a single job detail ─────────────────────────────────────────────────
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'username role avatar')
    .populate('applications.applicant', 'username role avatar');
  if (!job) throw new ApiError(404, 'Job not found');
  res.json(new ApiResponse(200, job, 'Job detail'));
});

// ─── Apply for a job (villager) ───────────────────────────────────────────────
export const applyForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.status !== 'open') throw new ApiError(400, 'This job is no longer accepting applications');

  const alreadyApplied = job.applications.some(a => a.applicant.toString() === req.user._id.toString());
  if (alreadyApplied) throw new ApiError(400, 'You have already applied for this job');

  job.applications.push({ applicant: req.user._id, message: req.body.message || '' });
  await job.save();
  res.json(new ApiResponse(200, job, 'Applied successfully'));
});

// ─── Hire / reject an applicant (job owner only) ──────────────────────────────
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'hired' | 'rejected'
  if (!['hired', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');

  const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found or access denied');

  const application = job.applications.id(req.params.appId);
  if (!application) throw new ApiError(404, 'Application not found');

  application.status = status;
  // If someone is hired and we've filled the needed workers, close the job
  const hiredCount = job.applications.filter(a => a.status === 'hired').length;
  if (hiredCount >= job.workers) job.status = 'filled';

  await job.save();
  await job.populate('applications.applicant', 'username role avatar');
  res.json(new ApiResponse(200, job, `Application ${status}`));
});

// ─── Close / delete a posted job (owner only) ─────────────────────────────────
export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, postedBy: req.user._id },
    { status: 'closed' },
    { new: true }
  );
  if (!job) throw new ApiError(404, 'Job not found or access denied');
  res.json(new ApiResponse(200, job, 'Job closed'));
});

// ─── Browse villager workers (for farmer / retailer) ─────────────────────────
export const getWorkers = asyncHandler(async (req, res) => {
  const { search, skill } = req.query;
  // Only villager role users are "workers"
  const query = { role: 'villager' };

  // We do the search on user model fields
  if (search) query.$or = [
    { username: new RegExp(search, 'i') },
    { 'location.city': new RegExp(search, 'i') },
    { 'location.address': new RegExp(search, 'i') },
  ];

  const workers = await User.find(query)
    .select('username avatar role location')
    .lean();

  res.json(new ApiResponse(200, workers, 'Workers fetched'));
});
