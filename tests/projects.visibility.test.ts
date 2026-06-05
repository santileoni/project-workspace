import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient, ProjectStatus, UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/projects/route";

const prisma = new PrismaClient();

const fixture = {
  orgA: "test-org-a",
  orgB: "test-org-b",
  userA: "test-user-a",
  userB: "test-user-b"
};

async function resetFixture() {
  await cleanupFixture();

  await prisma.organization.createMany({
    data: [
      {
        id: fixture.orgA,
        name: "Test Org A",
        slug: "test-org-a"
      },
      {
        id: fixture.orgB,
        name: "Test Org B",
        slug: "test-org-b"
      }
    ]
  });

  await prisma.user.createMany({
    data: [
      {
        id: fixture.userA,
        email: "user-a@test.example",
        name: "User A",
        role: UserRole.ADMIN,
        organizationId: fixture.orgA
      },
      {
        id: fixture.userB,
        email: "user-b@test.example",
        name: "User B",
        role: UserRole.MEMBER,
        organizationId: fixture.orgB
      }
    ]
  });

  await prisma.project.createMany({
    data: [
      {
        id: "test-project-a-1",
        name: "A Roadmap",
        status: ProjectStatus.ACTIVE,
        organizationId: fixture.orgA
      },
      {
        id: "test-project-a-2",
        name: "A Launch Plan",
        status: ProjectStatus.PAUSED,
        organizationId: fixture.orgA
      },
      {
        id: "test-project-b-1",
        name: "B Onboarding",
        status: ProjectStatus.ACTIVE,
        organizationId: fixture.orgB
      },
      {
        id: "test-project-b-2",
        name: "B Expansion",
        status: ProjectStatus.ACTIVE,
        organizationId: fixture.orgB
      }
    ]
  });
}

async function cleanupFixture() {
  await prisma.project.deleteMany({
    where: {
      organizationId: {
        in: [fixture.orgA, fixture.orgB]
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      organizationId: {
        in: [fixture.orgA, fixture.orgB]
      }
    }
  });

  await prisma.organization.deleteMany({
    where: {
      id: {
        in: [fixture.orgA, fixture.orgB]
      }
    }
  });
}

describe("project lists", () => {
  beforeEach(async () => {
    await resetFixture();
  });

  afterAll(async () => {
    await cleanupFixture();
    await prisma.$disconnect();
  });

  it("returns the expected projects for each selected user", async () => {
    const projectsForUserA = await requestProjects(fixture.userA);
    const projectsForUserB = await requestProjects(fixture.userB);
    const testProjectsForUserA = projectsForUserA.projects.filter((project) =>
      project.id.startsWith("test-project-")
    );
    const testProjectsForUserB = projectsForUserB.projects.filter((project) =>
      project.id.startsWith("test-project-")
    );

    expect(testProjectsForUserA.map((project) => project.name)).toEqual([
      "A Launch Plan",
      "A Roadmap"
    ]);
    expect(testProjectsForUserA.every((project) => project.organizationId === fixture.orgA)).toBe(
      true
    );

    expect(testProjectsForUserB.map((project) => project.name)).toEqual([
      "B Expansion",
      "B Onboarding"
    ]);
    expect(testProjectsForUserB.every((project) => project.organizationId === fixture.orgB)).toBe(
      true
    );
  });
});

async function requestProjects(userId: string) {
  const request = new NextRequest("http://localhost/api/projects", {
    headers: {
      "x-user-id": userId
    }
  });
  const response = await GET(request);

  expect(response.status).toBe(200);

  return (await response.json()) as {
    projects: Array<{
      id: string;
      name: string;
      organizationId: string;
    }>;
  };
}
