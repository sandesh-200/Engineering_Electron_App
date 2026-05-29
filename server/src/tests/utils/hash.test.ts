/**
 * Tests: Password Hashing Utility (src/utils/hash.ts)
 *
 * WHY this matters for assessment:
 *   Password hashing is a security-critical operation.  These tests verify:
 *   1. Passwords are never stored in plain text (output ≠ input).
 *   2. The same input always verifies correctly (no bcrypt config drift).
 *   3. Wrong passwords are firmly rejected.
 *
 * NO MOCKING — bcrypt is intentionally exercised for real here.
 *   Mocking bcrypt would test nothing about the actual hashing behaviour.
 *   The slight runtime cost is acceptable for these critical security checks.
 */

import { hashPassword, comparePassword } from "../../utils/hash";

describe("hashPassword", () => {
  it("should return a bcrypt hash that is different from the plain password", async () => {
    const plain = "mySecurePassword123";
    const hashed = await hashPassword(plain);

    // Basic sanity: the hash must not equal the input
    expect(hashed).not.toBe(plain);

    // bcrypt hashes always start with the $2b$ or $2a$ prefix
    expect(hashed).toMatch(/^\$2[ab]\$/);
  });

  it("should produce a different hash each time (bcrypt salts are unique)", async () => {
    const plain = "mySecurePassword123";
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    // Even with the same input the hashes must differ because bcrypt
    // generates a random salt per call — this prevents rainbow-table attacks.
    expect(hash1).not.toBe(hash2);
  });
});

describe("comparePassword", () => {
  it("should return true when the plain password matches its hash", async () => {
    const plain = "correctPassword!";
    const hash = await hashPassword(plain);

    const result = await comparePassword(plain, hash);
    expect(result).toBe(true);
  });

  it("should return false when the plain password does NOT match", async () => {
    const hash = await hashPassword("correctPassword!");
    const result = await comparePassword("wrongPassword!", hash);

    expect(result).toBe(false);
  });

  it("should return false for an empty string against a real hash", async () => {
    const hash = await hashPassword("somePassword");
    const result = await comparePassword("", hash);

    expect(result).toBe(false);
  });
});
