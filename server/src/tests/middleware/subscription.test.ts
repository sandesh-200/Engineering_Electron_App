import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { checkSubscription } from "../../middleware/subscription.middleware";
import { enforceProjectLimit } from "../../middleware/projectLimit.middleware";

jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
  },
}));

import prisma from "../../config/prisma";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockProjectCount = prisma.project.count as jest.Mock;

const makeReq = (userId = "user-123"): AuthRequest => {
  const req = {} as AuthRequest;
  req.user = { id: userId, role: "ENGINEER" };
  return req;
};

const makeRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeNext = (): NextFunction => jest.fn();

describe("checkSubscription middleware", () => {
  it("should call next() for a user with no expiry date (unlimited plan)", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "PROFESSIONAL",
      subscriptionExpiresAt: null, 
    });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await checkSubscription(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should call next() and attach subscription info when subscription is active", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days ahead

    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "FREE_TRIAL",
      subscriptionExpiresAt: futureDate,
    });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await checkSubscription(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    // The middleware should have attached subscription data onto req
    expect(req.subscription).toEqual({
      plan: "FREE_TRIAL",
      expiresAt: futureDate,
    });
  });

  it("should respond 403 when the subscription has expired", async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago

    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "FREE_TRIAL",
      subscriptionExpiresAt: pastDate,
    });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await checkSubscription(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/expired/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond 404 when the user does not exist in the database", async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await checkSubscription(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// enforceProjectLimit tests
// ---------------------------------------------------------------------------

describe("enforceProjectLimit middleware", () => {
  it("should call next() when a FREE_TRIAL user has fewer than 2 projects", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "FREE_TRIAL",
    });
    mockProjectCount.mockResolvedValue(1); // only 1 project so far

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await enforceProjectLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should respond 403 when a FREE_TRIAL user already has 2 projects", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "FREE_TRIAL",
    });
    mockProjectCount.mockResolvedValue(2);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await enforceProjectLimit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/free trial limit/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should bypass the limit entirely for a PROFESSIONAL user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "PROFESSIONAL",
    });
    mockProjectCount.mockResolvedValue(999);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await enforceProjectLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(prisma.project.count).not.toHaveBeenCalled();
  });

  it("should bypass the limit entirely for an ENTERPRISE user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-123",
      subscriptionPlan: "ENTERPRISE",
    });

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await enforceProjectLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(prisma.project.count).not.toHaveBeenCalled();
  });

  it("should respond 404 when the user is not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await enforceProjectLimit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});
