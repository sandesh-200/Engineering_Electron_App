import { Request, Response } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/project.service";

import { AuthRequest } from "../middleware/auth.middleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const project = await createProject({
      ...req.body,
      creatorId: req.user!.id,
    });

    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await getProjects(req.user!.id, req.user!.role);

    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await getProjectById(id, req.user!.id, req.user!.role);

    res.json(project);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const project = await updateProject(
      id,
      req.user!.id,
      req.user!.role,
      req.body,
    );

    res.json(project);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    await deleteProject(id, req.user!.id, req.user!.role);
    res.json({ message: "Project deleted" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
