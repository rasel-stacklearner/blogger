import { Router, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { logger } from "../utils/logger";
import { z } from "zod";

const router: Router = Router();

// Validation schema for creating a user
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email is too long"),
});

// Create a new user
router.post("/users", async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validatedData = createUserSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "Validation error",
        details: [{ message: "Email already exists" }],
      });
    }

    // Insert the user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        createdAt: new Date(),
      })
      .returning();

    // Return the new user
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
router.get("/users", async (_req: Request, res: Response): Promise<any> => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(result);
  } catch (error) {
    logger.error("Error fetching users: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
