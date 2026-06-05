import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

const projectStatuses = new Set<string>(Object.values(ProjectStatus));

export class InvalidProjectInputError extends Error {
  statusCode = 400;
}

export async function listProjectsForUser(userId: string) {
  await requireCurrentUser(userId);

  return prisma.project.findMany({
    include: {
      organization: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

type CreateProjectInput = {
  name?: unknown;
  status?: unknown;
};

export async function createProjectForUser(userId: string, input: CreateProjectInput) {
  const currentUser = await requireCurrentUser(userId);
  const name = parseProjectName(input.name);
  const status = parseProjectStatus(input.status);

  return prisma.project.create({
    data: {
      name,
      status,
      organizationId: currentUser.organizationId
    },
    include: {
      organization: true
    }
  });
}

function parseProjectName(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidProjectInputError("Project name is required.");
  }

  const name = value.trim();

  if (name.length > 80) {
    throw new InvalidProjectInputError("Project name must be 80 characters or fewer.");
  }

  return name;
}

function parseProjectStatus(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return ProjectStatus.ACTIVE;
  }

  if (typeof value !== "string" || !projectStatuses.has(value)) {
    throw new InvalidProjectInputError("Project status is invalid.");
  }

  return value as ProjectStatus;
}
