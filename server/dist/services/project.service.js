"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createProject = async (data) => {
    return await prisma_1.default.project.create({
        data,
    });
};
exports.createProject = createProject;
const getProjects = async (userId, role) => {
    if (role === "ADMIN") {
        return await prisma_1.default.project.findMany({
            include: { creator: true },
        });
    }
    return await prisma_1.default.project.findMany({
        where: { creatorId: userId },
    });
};
exports.getProjects = getProjects;
const getProjectById = async (id, userId, role) => {
    const project = await prisma_1.default.project.findUnique({
        where: { id },
        include: { creator: true },
    });
    if (!project)
        throw new Error("Project not found");
    // Enforce ownership unless the requester is an ADMIN
    if (role !== "ADMIN" && project.creatorId !== userId) {
        throw new Error("Not allowed");
    }
    return project;
};
exports.getProjectById = getProjectById;
const updateProject = async (id, userId, role, data) => {
    const project = await prisma_1.default.project.findUnique({
        where: { id },
    });
    if (!project)
        throw new Error("Project not found");
    if (role !== "ADMIN" && project.creatorId !== userId) {
        throw new Error("Not allowed");
    }
    return prisma_1.default.project.update({
        where: { id },
        data,
    });
};
exports.updateProject = updateProject;
const deleteProject = async (id, userId, role) => {
    const project = await prisma_1.default.project.findUnique({
        where: { id },
    });
    if (!project)
        throw new Error("Project not found");
    if (role !== "ADMIN" && project.creatorId !== userId) {
        throw new Error("Not allowed");
    }
    return prisma_1.default.project.delete({
        where: { id },
    });
};
exports.deleteProject = deleteProject;
