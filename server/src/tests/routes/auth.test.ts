import request from "supertest";
import app from "../../app";


jest.mock("../../services/auth.service", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getMe: jest.fn(),
}));


jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    loginLog: { create: jest.fn() },
    project: { count: jest.fn() },
  },
}));

import * as authService from "../../services/auth.service";

const mockRegisterUser = authService.registerUser as jest.Mock;
const mockLoginUser = authService.loginUser as jest.Mock;
const mockGetMe = authService.getMe as jest.Mock;



const validUser = {
  id: "user-uuid-001",
  name: "Jane Engineer",
  email: "jane@example.com",
  role: "ENGINEER",
  subscriptionPlan: "FREE_TRIAL",
  subscriptionExpiresAt: null,
  isActive: true,
  createdAt: new Date().toISOString(),
};

describe("POST /api/auth/register", () => {
  it("should return 201 and the created user on valid input", async () => {
    mockRegisterUser.mockResolvedValue(validUser);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jane Engineer", email: "jane@example.com", password: "Secret123!" });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered successfully/i);
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.user.email).toBe("jane@example.com");
  });

  it("should return 400 when the email is already registered", async () => {
    mockRegisterUser.mockRejectedValue(new Error("User already exists"));

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Dupe User", email: "jane@example.com", password: "Secret123!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});



describe("POST /api/auth/login", () => {
  it("should return 200 and set an HTTP-only cookie on valid credentials", async () => {
    mockLoginUser.mockResolvedValue({ user: validUser, token: "mock.jwt.token" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@example.com", password: "Secret123!" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/login successful/i);


    const rawCookie = res.headers["set-cookie"];
    const cookies: string[] = Array.isArray(rawCookie) ? rawCookie : rawCookie ? [rawCookie] : [];
    const tokenCookie = cookies.find((c: string) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toMatch(/HttpOnly/i);
  });

  it("should return the token in the response body", async () => {
    mockLoginUser.mockResolvedValue({ user: validUser, token: "mock.jwt.token" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@example.com", password: "Secret123!" });

    expect(res.body.token).toBe("mock.jwt.token");
  });

  it("should return 401 on invalid credentials", async () => {
    mockLoginUser.mockRejectedValue(new Error("Invalid credentials"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@example.com", password: "WrongPassword!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("should return 401 when the account is suspended", async () => {
    mockLoginUser.mockRejectedValue(
      new Error("Account is suspended. Contact your administrator.")
    );

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "suspended@example.com", password: "Secret123!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/suspended/i);
  });
});



describe("POST /api/auth/logout", () => {
  it("should return 200 and clear the token cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);

    // The cookie should be cleared (expires in the past or Max-Age=0).
    const rawCookie = res.headers["set-cookie"];
    const cookies: string[] = Array.isArray(rawCookie) ? rawCookie : rawCookie ? [rawCookie] : [];
    const cleared = cookies.find((c: string) => c.startsWith("token="));
    // When Express calls res.clearCookie() it sends an expired cookie header
    expect(cleared).toBeDefined();
  });
});



describe("GET /api/auth/me", () => {
  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).get("/api/auth/me");

    // The authenticate middleware should reject the request before
    // the controller even runs
    expect(res.status).toBe(401);
  });

  it("should return the user profile when a valid token cookie is present", async () => {
    // Generate a real JWT so the authenticate middleware passes
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: validUser.id, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    mockGetMe.mockResolvedValue(validUser);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(validUser.id);
    expect(res.body.email).toBe(validUser.email);
  });

  it("should return 401 when the token is malformed", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "token=this.is.not.a.real.jwt");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid token/i);
  });
});
