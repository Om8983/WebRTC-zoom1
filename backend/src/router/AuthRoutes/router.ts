import { Router } from "express";
import { Request, Response } from "express";
import {
  userLoginValidation,
  userSignupValidation,
} from "../../middleware/userValidation";
import { login, signup } from "../../controllers/auth/authControllers";
import { authFunction, fallbackPath, userScope } from "./googleAuth";

const router = Router();

router.get("/google", userScope);
router.get("/google/callback", fallbackPath, authFunction);

router.post(
  "/signup",
  // signinSchemaValidation,
  userSignupValidation,
  async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      signup(req, res);
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error." });
    }
  },
);

router.post(
  "/login",
  //   loginSchemaValidation(userLoginSchema),
  userLoginValidation,
  async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      await login(req, res);
    } catch (error) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  },
);
