import {
  CareerJob,
  Interview,
  JobFollowup,
  Recruiter,
  CVVersion,
} from "@/types";
import { list, insert, update, remove } from "./store";
import { webUrl } from "./validation";
type JobRow = CareerJob & {
  job_title: string;
  applied_at: string;
  salary_raw?: string;
  followup_at?: string;
};
const map = (j: JobRow): CareerJob => ({
  ...j,
  title: j.job_title,
  applied_date: j.applied_at,
  salary: j.salary_raw,
  follow_up_date: j.followup_at,
});
function jobInput(input: Partial<CareerJob>) {
  const {
    title,
    applied_date,
    salary,
    follow_up_date,
    recruiter,
    cv_version,
    id,
    user_id,
    ...rest
  } = input;
  return {
    ...rest,
    ...(input.job_url !== undefined ? { job_url: webUrl(input.job_url) } : {}),
    ...(title !== undefined ? { job_title: title.trim() } : {}),
    ...(applied_date !== undefined ? { applied_at: applied_date } : {}),
    ...(salary !== undefined ? { salary_raw: salary } : {}),
    ...(follow_up_date !== undefined ? { followup_at: follow_up_date } : {}),
  };
}
export const careerService = {
  async getJobs() {
    const [jobs, recruiters, cvs] = await Promise.all([
      list<JobRow>("jobs"),
      this.getRecruiters(),
      this.getCVVersions(),
    ]);
    return jobs.map((j) => ({
      ...map(j),
      recruiter: recruiters.find((r) => r.id === j.recruiter_id)?.name,
      cv_version: cvs.find((c) => c.id === j.cv_version_id)?.name,
    }));
  },
  async createJob(
    input: Partial<CareerJob> & { title: string; company: string },
  ) {
    return map(await insert<JobRow>("jobs", jobInput(input), "career"));
  },
  async updateJob(id: string, input: Partial<CareerJob>) {
    return map(await update<JobRow>("jobs", id, jobInput(input), "career"));
  },
  updateJobStatus: (id: string, status: CareerJob["status"]) =>
    update("jobs", id, { status }, "career"),
  deleteJob: (id: string) => remove("jobs", id, "career"),
  async getInterviews() {
    const [rows, jobs] = await Promise.all([
      list<Interview>("interviews"),
      list<JobRow>("jobs"),
    ]);
    return rows.map((r) => ({
      ...r,
      job_title: jobs.find((j) => j.id === r.job_id)?.job_title || "",
      company: jobs.find((j) => j.id === r.job_id)?.company || "",
    }));
  },
  createInterview: (
    input: Omit<Interview, "id" | "user_id" | "job_title" | "company">,
  ) =>
    insert<Interview>(
      "interviews",
      { ...input, meeting_url: webUrl(input.meeting_url) },
      "career",
    ),
  updateInterview: (
    id: string,
    input: Partial<Omit<Interview, "id" | "user_id" | "job_title" | "company">>,
  ) => update<Interview>("interviews", id, input, "career"),
  deleteInterview: (id: string) => remove("interviews", id, "career"),
  async getFollowups() {
    const [rows, jobs] = await Promise.all([
      list<JobFollowup>("job_followups"),
      list<JobRow>("jobs"),
    ]);
    return rows.map((r) => ({
      ...r,
      job_title: jobs.find((j) => j.id === r.job_id)?.job_title || "",
      company: jobs.find((j) => j.id === r.job_id)?.company || "",
    }));
  },
  createFollowup: (
    input: Omit<JobFollowup, "id" | "user_id" | "job_title" | "company">,
  ) => insert<JobFollowup>("job_followups", input, "career"),
  completeFollowup: (id: string) =>
    update("job_followups", id, { status: "completed" }, "career"),
  deleteFollowup: (id: string) => remove("job_followups", id, "career"),
  getRecruiters: () => list<Recruiter>("recruiters"),
  createRecruiter: (input: Omit<Recruiter, "id" | "user_id">) =>
    insert<Recruiter>("recruiters", input, "career"),
  updateRecruiter: (
    id: string,
    input: Partial<Omit<Recruiter, "id" | "user_id">>,
  ) => update<Recruiter>("recruiters", id, input, "career"),
  deleteRecruiter: (id: string) => remove("recruiters", id, "career"),
  getCVVersions: () => list<CVVersion>("cv_versions"),
  createCVVersion: (input: Pick<CVVersion, "name" | "file_url" | "notes">) =>
    insert<CVVersion>(
      "cv_versions",
      { ...input, file_url: webUrl(input.file_url) },
      "career",
    ),
  updateCVVersion: (
    id: string,
    input: Pick<CVVersion, "name" | "file_url" | "notes">,
  ) => update<CVVersion>("cv_versions", id, input, "career"),
  deleteCVVersion: (id: string) => remove("cv_versions", id, "career"),
};
