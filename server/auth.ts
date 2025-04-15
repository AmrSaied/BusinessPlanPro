import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Check if it's a simple SHA-256 hash (no salt)
  if (!stored.includes('.')) {
    // Simple SHA-256 hash
    const hash = createHash('sha256').update(supplied).digest('hex');
    return hash === stored;
  }
  
  // Scrypt with salt
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    store: storage.sessionStore,
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Configure how user objects are stored in and retrieved from the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registration attempt with data:", { 
        username: req.body.username,
        email: req.body.email,
        hasPassword: !!req.body.password
      });
      
      // Validate request body
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation error:", result.error.format());
        return res.status(400).json({ message: "Invalid registration data", errors: result.error.format() });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Username already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        console.log("Email already exists:", req.body.email);
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      const userData = { ...req.body, password: hashedPassword };
      console.log("Creating user with data:", { 
        username: userData.username,
        email: userData.email,
        hasHashedPassword: !!userData.password
      });
      
      const newUser = await storage.createUser(userData);
      console.log("User created successfully:", newUser.id);

      // Log the user in automatically
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        console.log("User logged in after registration:", newUser.id);
        return res.status(201).json(newUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error during registration" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Successfully logged out" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}