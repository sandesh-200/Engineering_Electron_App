import prisma from "../config/prisma";

export const createProject = async (data: {
  name: string;
  type: string;
  description: string;
  creatorId: string;
}) => {
  return await prisma.project.create({
    data,
  });
};

export const getProjects = async (userId: string, role: string) => {
  if (role === "ADMIN") {
    return await prisma.project.findMany({
      include: { creator: true },
    });
  }

  return await prisma.project.findMany({
    where: { creatorId: userId },
  });
};

export const getProjectById = async (
  id: string,
  userId: string,
  role: string,
) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!project) throw new Error("Project not found");

  // Enforce ownership unless the requester is an ADMIN
  if (role !== "ADMIN" && project.creatorId !== userId) {
    throw new Error("Not allowed");
  }

  return project;
};

export const updateProject = async (
  id: string,
  userId: string,
  role: string,
  data: any,
) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) throw new Error("Project not found");

  if (role !== "ADMIN" && project.creatorId !== userId) {
    throw new Error("Not allowed");
  }

  return prisma.project.update({
    where: { id },
    data,
  });
};

export const deleteProject = async (
  id: string,
  userId: string,
  role: string,
) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) throw new Error("Project not found");

  if (role !== "ADMIN" && project.creatorId !== userId) {
    throw new Error("Not allowed");
  }

  return prisma.project.delete({
    where: { id },
  });
};
