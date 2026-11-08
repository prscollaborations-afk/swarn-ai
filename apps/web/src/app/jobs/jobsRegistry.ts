// In-memory job registry for serverless / fallback try-on requests
interface JobRecord {
  job_id: string;
  asset_id: string;
  jewellery_type: "necklace" | "earrings" | "ring" | "bangles" | string;
  target_angles: string[];
  resolution: "HD" | "4K" | string;
  model_info?: string;
  status: "processing" | "completed" | "failed";
  created_at: number;
}

const jobsRegistry = new Map<string, JobRecord>();

export function saveJob(job: JobRecord) {
  jobsRegistry.set(job.job_id, job);
  // Keep max 100 jobs to avoid memory leaks
  if (jobsRegistry.size > 100) {
    const firstKey = jobsRegistry.keys().next().value;
    if (firstKey) jobsRegistry.delete(firstKey);
  }
}

export function getJob(jobId: string): JobRecord | undefined {
  return jobsRegistry.get(jobId);
}

