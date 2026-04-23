import mongoose, { Schema } from 'mongoose';

const applicationSchema = new Schema({
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'hired', 'rejected'], default: 'pending' },
  message: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
});

const jobSchema = new Schema(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, required: true }, // e.g. "Harvesting", "Irrigation"
    skills: [{ type: String }],             // required skill tags
    location: { type: String, default: '' },
    pay: { type: String, required: true },  // e.g. "₹450/day"
    workers: { type: Number, default: 1 },  // number of workers needed
    duration: { type: String, default: '' },// e.g. "3 days"
    status: { type: String, enum: ['open', 'filled', 'closed'], default: 'open' },
    applications: [applicationSchema],
  },
  { timestamps: true }
);

export const Job = mongoose.model('Job', jobSchema);
