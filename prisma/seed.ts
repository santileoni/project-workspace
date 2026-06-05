import { BillingPlan, PrismaClient, ProjectStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const organizations = [
  {
    id: "org-nimbus",
    name: "Nimbus Labs",
    slug: "nimbus",
    plan: BillingPlan.FREE,
    users: [
      {
        id: "user-ana",
        email: "ana@nimbus.example",
        name: "Ana Nimbus",
        role: UserRole.ADMIN
      }
    ],
    projects: [
      {
        id: "project-nimbus-roadmap",
        name: "Roadmap",
        status: ProjectStatus.ACTIVE
      },
      {
        id: "project-nimbus-billing",
        name: "Billing Cleanup",
        status: ProjectStatus.PAUSED
      },
      {
        id: "project-nimbus-archive",
        name: "Legacy Migration",
        status: ProjectStatus.ARCHIVED
      }
    ]
  },
  {
    id: "org-cobalt",
    name: "Cobalt Studio",
    slug: "cobalt",
    plan: BillingPlan.PRO,
    users: [
      {
        id: "user-ben",
        email: "ben@cobalt.example",
        name: "Ben Cobalt",
        role: UserRole.MEMBER
      }
    ],
    projects: [
      {
        id: "project-cobalt-launch",
        name: "Launch Plan",
        status: ProjectStatus.ACTIVE
      },
      {
        id: "project-cobalt-research",
        name: "Research Pipeline",
        status: ProjectStatus.ACTIVE
      }
    ]
  }
];

async function main() {
  const organizationIds = organizations.map((organization) => organization.id);
  const userIds = organizations.flatMap((organization) =>
    organization.users.map((user) => user.id)
  );
  const projectIds = organizations.flatMap((organization) =>
    organization.projects.map((project) => project.id)
  );

  await prisma.project.deleteMany({
    where: {
      organizationId: { in: organizationIds },
      id: { notIn: projectIds }
    }
  });

  await prisma.user.deleteMany({
    where: {
      organizationId: { in: organizationIds },
      id: { notIn: userIds }
    }
  });

  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { id: organization.id },
      update: {
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan
      },
      create: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan
      }
    });

    for (const user of organization.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: organization.id
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: organization.id
        }
      });
    }

    for (const project of organization.projects) {
      await prisma.project.upsert({
        where: { id: project.id },
        update: {
          name: project.name,
          status: project.status,
          organizationId: organization.id
        },
        create: {
          id: project.id,
          name: project.name,
          status: project.status,
          organizationId: organization.id
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
