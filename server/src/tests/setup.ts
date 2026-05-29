/**
 * Global Test Setup
 *
 * This file runs before every test file (via Jest `setupFiles`).
 * Its job is to inject environment variables that the app reads at
 * module load time — specifically the JWT secret and the database URL.
 *
 * WHY here and not inside each test?
 *   Because several modules (jwt.ts, prisma.ts) read env vars when they
 *   are first imported. If the vars aren't set before the import, you get
 *   "undefined" secrets or connection errors at require-time, not at test-time.
 */

// Provide a fixed, deterministic secret for JWT tests.
// Never use a real secret here; this value is test-only.
process.env.JWT_SECRET = "test-super-secret-key-for-jest";

// Point Prisma at a dummy URL so the client can be instantiated without
// a real database.  All Prisma calls are mocked in tests, so no DB is
// actually contacted.
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

process.env.NODE_ENV = "test";
