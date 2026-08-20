import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@mydrive.local" },
    update: {},
    create: {
      email: "demo@mydrive.local",
      name: "Demo User",
      passwordHash,
    },
  });

  const docs = await prisma.folder.upsert({
    where: { id: "demo-docs" },
    update: { name: "Documents" },
    create: {
      id: "demo-docs",
      name: "Documents",
      ownerId: user.id,
    },
  });

  await prisma.folder.upsert({
    where: { id: "demo-projects" },
    update: { name: "Projects" },
    create: {
      id: "demo-projects",
      name: "Projects",
      ownerId: user.id,
    },
  });

  const readme = await prisma.folder.upsert({
    where: { id: "demo-readme-sub" },
    update: { parentFolderId: docs.id },
    create: {
      id: "demo-readme-sub",
      name: "Docs sub",
      ownerId: user.id,
      parentFolderId: docs.id,
    },
  });

  const files = [
    {
      id: "demo-readme-md",
      name: "README.md",
      mimeType: "text/markdown",
      size: 4096n,
      storageKey: "demo/README.md",
      extension: "md",
      parentFolderId: readme.id,
    },
    {
      id: "demo-banner-png",
      name: "banner.png",
      mimeType: "image/png",
      size: 1048576n,
      storageKey: "demo/banner.png",
      extension: "png",
      parentFolderId: null,
    },
    {
      id: "demo-sample-pdf",
      name: "sample.pdf",
      mimeType: "application/pdf",
      size: 262144n,
      storageKey: "demo/sample.pdf",
      extension: "pdf",
      parentFolderId: null,
    },
  ];

  for (const file of files) {
    await prisma.file.upsert({
      where: { id: file.id },
      update: { ...file },
      create: { ...file, ownerId: user.id },
    });
  }

  console.log("Seed selesai: user demo@mydrive.local / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
