export interface TryOnImage {
  id: string;
  url: string;
  angle: string;
  label: string;
  resolution: string;
  fidelity_score: number;
  model_info: string;
}

export interface JobRecord {
  job_id: string;
  asset_id: string;
  jewellery_type: "necklace" | "earrings" | "ring" | "bangles" | string;
  target_angles: string[];
  resolution: "HD" | "4K" | string;
  model_info?: string;
  design_lock?: string;
  status: "processing" | "completed" | "failed";
  images?: TryOnImage[];
  created_at: number;
}

// Global registry persisting across route calls in the process
declare global {
  // eslint-disable-next-line no-var
  var __aabhushan_jobs_registry: Map<string, JobRecord> | undefined;
}

if (!global.__aabhushan_jobs_registry) {
  global.__aabhushan_jobs_registry = new Map<string, JobRecord>();
}

const jobsRegistry = global.__aabhushan_jobs_registry;

export function saveJob(job: JobRecord) {
  jobsRegistry.set(job.job_id, job);
  if (jobsRegistry.size > 100) {
    const firstKey = jobsRegistry.keys().next().value;
    if (firstKey) jobsRegistry.delete(firstKey);
  }
}

export function updateJob(jobId: string, partial: Partial<JobRecord>) {
  const existing = jobsRegistry.get(jobId);
  if (existing) {
    Object.assign(existing, partial);
    jobsRegistry.set(jobId, existing);
  }
}

export function getJob(jobId: string): JobRecord | undefined {
  return jobsRegistry.get(jobId);
}
