"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getOne = exports.getAll = exports.create = void 0;
const project_service_1 = require("../services/project.service");
const create = async (req, res) => {
    try {
        const project = await (0, project_service_1.createProject)({
            ...req.body,
            creatorId: req.user.id,
        });
        res.status(201).json(project);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.create = create;
const getAll = async (req, res) => {
    try {
        const projects = await (0, project_service_1.getProjects)(req.user.id, req.user.role);
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAll = getAll;
const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const project = await (0, project_service_1.getProjectById)(id, req.user.id, req.user.role);
        res.json(project);
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
};
exports.getOne = getOne;
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const project = await (0, project_service_1.updateProject)(id, req.user.id, req.user.role, req.body);
        res.json(project);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const id = req.params.id;
        await (0, project_service_1.deleteProject)(id, req.user.id, req.user.role);
        res.json({ message: "Project deleted" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.remove = remove;
