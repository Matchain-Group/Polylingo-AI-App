import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, otpCodesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken, verifyToken, requireAuth, type JwtPayload } from "../lib/auth";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };

    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      passwordHash,
      name,
    }).returning();

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (users.length === 0) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpCodesTable).values({
      userId: user.id,
      code: otp,
      expiresAt,
    });

    console.log(`[Polylingo AI] OTP for ${email}: ${otp}`);

    res.json({
      message: "Verification code sent to your email. Check the console in dev mode.",
      devOtp: process.env["NODE_ENV"] !== "production" ? otp : undefined,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };

    if (!email || !otp) {
      res.status(400).json({ error: "email and otp are required" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (users.length === 0) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const user = users[0];
    const now = new Date();

    const codes = await db.select().from(otpCodesTable).where(
      and(
        eq(otpCodesTable.userId, user.id),
        eq(otpCodesTable.code, otp),
        eq(otpCodesTable.used, false),
        gt(otpCodesTable.expiresAt, now),
      )
    ).limit(1);

    if (codes.length === 0) {
      res.status(400).json({ error: "Invalid or expired verification code" });
      return;
    }

    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, codes[0].id));

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }

  const payload = verifyToken(token);
  if (!payload) { res.status(401).json({ error: "Invalid token" }); return; }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
  if (users.length === 0) { res.status(401).json({ error: "User not found" }); return; }

  const user = users[0];
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
