"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateProjectFormProps = {
  userId: string;
};

export function CreateProjectForm({ userId }: CreateProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ name, status })
    });
    const payload = (await response.json()) as { error?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to create project.");
      return;
    }

    setName("");
    setStatus("ACTIVE");
    setMessage("Project created.");
    router.refresh();
  }

  return (
    <form className="create-project" onSubmit={onSubmit}>
      <div>
        <p className="form-title">New project</p>
        <label htmlFor="project-name">Name</label>
        <input
          id="project-name"
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Q3 launch"
          type="text"
          value={name}
        />
      </div>
      <div>
        <label htmlFor="project-status">Status</label>
        <select
          id="project-status"
          name="status"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}
