
import { Response, NextFunction } from "express";
import { authorize } from "../../middleware/role.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const makeReq = (role?: "ADMIN" | "ENGINEER" | "VIEWER"): AuthRequest => {
  const req = {} as AuthRequest;
  if (role) {
    req.user = { id: "user-123", role };
  }
  return req;
};

const makeRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeNext = (): NextFunction => jest.fn();

describe("authorize middleware (RBAC)", () => {
  describe("when the user has an allowed role", () => {
    it("should call next() for an ADMIN accessing an ADMIN-only route", () => {
      const middleware = authorize(["ADMIN"]);
      const req = makeReq("ADMIN");
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next() for an ENGINEER on a multi-role route", () => {
      const middleware = authorize(["ADMIN", "ENGINEER"]);
      const req = makeReq("ENGINEER");
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should call next() for a VIEWER on a VIEWER-allowed route", () => {
      const middleware = authorize(["VIEWER"]);
      const req = makeReq("VIEWER");
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the user has an insufficient role", () => {
    it("should respond 403 when a VIEWER tries an ADMIN-only route", () => {
      const middleware = authorize(["ADMIN"]);
      const req = makeReq("VIEWER");
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringMatching(/forbidden/i) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should respond 403 when an ENGINEER tries an ADMIN-only route", () => {
      const middleware = authorize(["ADMIN"]);
      const req = makeReq("ENGINEER");
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("when there is no authenticated user on the request", () => {
    it("should respond 401 when req.user is undefined", () => {
      const middleware = authorize(["ADMIN"]);
      const req = makeReq();
      const res = makeRes();
      const next = makeNext();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
