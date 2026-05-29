"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register = async (req, res) => {
    try {
        const user = await (0, auth_service_1.registerUser)(req.body);
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const ipAddress = req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "unknown";
        const deviceInfo = req.headers["user-agent"] || "unknown";
        const { user, token } = await (0, auth_service_1.loginUser)(req.body, { ipAddress, deviceInfo });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ message: "Login successful", user, token });
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await (0, auth_service_1.getMe)(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        return res.json(user);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.getMe = getMe;
