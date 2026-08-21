import { Router } from "express";
import { Request, Response } from "express";
import {
  userLoginValidation,
  userSignupValidation,
} from "../../middleware/userValidation";
import { login, signup } from "../../controllers/auth/authControllers";

const router = Router();

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
