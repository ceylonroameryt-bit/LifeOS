"use client";
import { useState } from "react";
import { careerService } from "@/lib/services/careerService";
import { useData } from "@/lib/useData";
const load = async () => {
  const [jobs, interviews, followups, recruiters, cvs] = await Promise.all([
    careerService.getJobs(),
    careerService.getInterviews(),
    careerService.getFollowups(),
    careerService.getRecruiters(),
    careerService.getCVVersions(),
  ]);
  return { jobs, interviews, followups, recruiters, cvs };
};
export function CareerRecords() {
  const data = useData(
    load,
    { jobs: [], interviews: [], followups: [], recruiters: [], cvs: [] },
    "lifeos-career-updated",
  );
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>, kind: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const value = (key: string) => String(values.get(key) || "");
    setBusy(true);
    try {
      if (kind === "recruiter")
        await careerService.createRecruiter({
          name: value("name"),
          email: value("email") || undefined,
          company: value("company") || undefined,
        });
      if (kind === "cv")
        await careerService.createCVVersion({
          name: value("name"),
          file_url: value("url") || undefined,
          notes: value("notes") || undefined,
        });
      if (kind === "interview")
        await careerService.createInterview({
          job_id: value("job"),
          interview_date: value("date"),
          interview_time: value("time"),
          interview_type: "Other",
          stage: value("stage") || "First Round",
          meeting_url: value("url") || undefined,
        });
      if (kind === "followup")
        await careerService.createFollowup({
          job_id: value("job"),
          followup_date: value("date"),
          status: "pending",
          notes: value("notes"),
        });
      form.reset();
    } finally {
      setBusy(false);
    }
  }
  const input = "border border-border rounded-xl p-2 bg-surface text-sm w-full";
  const jobSelect = (
    <label>
      Job
      <select name="job" className={input} required>
        <option value="">Select a job</option>
        {data.jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title} — {j.company}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <section className="bg-surface border border-border rounded-3xl p-5 space-y-3">
        <h2 className="font-bold">Interviews</h2>
        {data.interviews.map((i) => (
          <div key={i.id} className="text-sm">
            {i.job_title} • {i.interview_date} {i.interview_time}
            <button
              className="text-danger ml-2"
              onClick={() => void careerService.deleteInterview(i.id)}
            >
              Delete
            </button>
          </div>
        ))}
        <details>
          <summary className="text-primary cursor-pointer">
            Schedule interview
          </summary>
          <form
            onSubmit={(e) => save(e, "interview")}
            className="space-y-2 mt-3"
          >
            {jobSelect}
            <label>
              Date
              <input name="date" type="date" required className={input} />
            </label>
            <label>
              Time
              <input name="time" type="time" className={input} />
            </label>
            <label>
              Stage
              <input name="stage" className={input} />
            </label>
            <label>
              Meeting link
              <input name="url" type="url" className={input} />
            </label>
            <button disabled={busy} className="text-primary">
              Save interview
            </button>
          </form>
        </details>
      </section>
      <section className="bg-surface border border-border rounded-3xl p-5 space-y-3">
        <h2 className="font-bold">Follow-ups</h2>
        {data.followups.map((f) => (
          <div key={f.id} className="text-sm">
            {f.company} • {f.followup_date} • {f.status}
            {f.status === "pending" && (
              <button
                className="text-primary ml-2"
                onClick={() => void careerService.completeFollowup(f.id)}
              >
                Complete
              </button>
            )}
            <button
              className="text-danger ml-2"
              onClick={() => void careerService.deleteFollowup(f.id)}
            >
              Delete
            </button>
          </div>
        ))}
        <details>
          <summary className="text-primary cursor-pointer">
            Add follow-up
          </summary>
          <form
            onSubmit={(e) => save(e, "followup")}
            className="space-y-2 mt-3"
          >
            {jobSelect}
            <label>
              Date
              <input name="date" type="date" required className={input} />
            </label>
            <label>
              Notes
              <input name="notes" className={input} />
            </label>
            <button disabled={busy} className="text-primary">
              Save follow-up
            </button>
          </form>
        </details>
      </section>
      <section className="bg-surface border border-border rounded-3xl p-5 space-y-3">
        <h2 className="font-bold">Recruiters</h2>
        {data.recruiters.map((r) => (
          <div key={r.id} className="text-sm">
            {r.name} • {r.company}
            <button
              className="text-danger ml-2"
              onClick={() => void careerService.deleteRecruiter(r.id)}
            >
              Delete
            </button>
          </div>
        ))}
        <details>
          <summary className="text-primary cursor-pointer">
            Add recruiter
          </summary>
          <form
            onSubmit={(e) => save(e, "recruiter")}
            className="space-y-2 mt-3"
          >
            <label>
              Name
              <input name="name" required className={input} />
            </label>
            <label>
              Company
              <input name="company" className={input} />
            </label>
            <label>
              Email
              <input name="email" type="email" className={input} />
            </label>
            <button disabled={busy} className="text-primary">
              Save recruiter
            </button>
          </form>
        </details>
      </section>
      <section className="bg-surface border border-border rounded-3xl p-5 space-y-3">
        <h2 className="font-bold">CV versions</h2>
        {data.cvs.map((c) => (
          <div key={c.id} className="text-sm">
            {c.name}
            <button
              className="text-danger ml-2"
              onClick={() => void careerService.deleteCVVersion(c.id)}
            >
              Delete
            </button>
          </div>
        ))}
        <details>
          <summary className="text-primary cursor-pointer">
            Add CV version
          </summary>
          <form onSubmit={(e) => save(e, "cv")} className="space-y-2 mt-3">
            <label>
              Name
              <input name="name" required className={input} />
            </label>
            <label>
              File link
              <input name="url" type="url" className={input} />
            </label>
            <label>
              Notes
              <input name="notes" className={input} />
            </label>
            <button disabled={busy} className="text-primary">
              Save CV version
            </button>
          </form>
        </details>
        <p className="text-xs text-slate-500">
          Store a private file link here; file uploads are managed by your
          storage provider.
        </p>
      </section>
    </div>
  );
}
