import { Router } from "express";
import { Request, Response } from "express";
import {
  userLoginValidation,
  userSignupValidation,
} from "../../middleware/userValidation";
import { login, logout, signup } from "../../controllers/auth/authControllers";
import { authFunction, fallbackPath, userScope } from "./googleAuth";
import jwt from "jsonwebtoken";
import { prisma } from "../../prismaInstance";

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

router.post("/logout", async (req: Request, res: Response) => {
  await logout(req, res);
});

router.get("/authCheck", async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    const { accesstoken, refreshtoken } = cookies;
    console.log("cookies", cookies);
    if (!accesstoken) {
      if (!refreshtoken) {
        res.status(401).json({ msg: "Invalid Credentials", userId: "" });
        return;
      }
      // extract user details from token
      // validate if user is existing
      const isVerifiedToken = jwt.verify(
        refreshtoken,
        process.env.REFRESHTOKEN_SECRET ?? "",
      );
      if (!isVerifiedToken) {
        res.status(401).json({ msg: "Invalid Credentials", userId: "" });
        return;
      }

      const user = jwt.decode(refreshtoken) as {
        id: string;
      };
      const userExist = await prisma.user.findFirst({
        where: {
          id: user?.id || "",
        },
        select: {
          id: true,
          email: true,
        },
      });
      if (!userExist) {
        res.status(404).json({ msg: "User not found", userId: "" });
        return;
      }

      const accessToken = jwt.sign(
        {
          id: userExist.id,
          email: userExist.email,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.ACCESSTOKEN_SECRET ?? "",
        {
          expiresIn: "15min",
        },
      );
      res.cookie("accesstoken", accessToken, {
        maxAge: 15 * 60 * 60,
        httpOnly: true,
      });
      res.status(200).json({ msg: "Success", userId: user.id });
    } else {
      const verifiedToken = jwt.verify(
        accesstoken,
        process.env.ACCESSTOKEN_SECRET ?? "",
      );
      if (!verifiedToken) {
        res
          .status(401)
          .json({ msg: "User credentials are invalid", userId: "" });
      }

      const userDetail = jwt.decode(accesstoken) as {
        id: string;
        email: string;
      };
      const userExist = await prisma.user.findFirst({
        where: {
          id: userDetail.id,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!userExist) {
        res.status(400).json({ msg: "No user found", userId: "" });
        return;
      }

      res.status(200).json({ msg: "success", userId: userDetail.id });
    }
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error.",
      userId: "",
    });
  }
});

// const accessToken = jwt.sign(
//   {
//     id: newUser.id,
//     email: userData.email,
//     iat: Math.floor(Date.now() / 1000),
//   },
//   process.env.ACCESSTOKEN_SECRET ?? "",
//   {
//     expiresIn: "15min",
//   },
// );
// const refreshToken = jwt.sign(
//   {
//     id: newUser.id,
//     iat: Math.floor(Date.now() / 1000),
//   },
//   process.env.REFRESHTOKEN_SECRET ?? "",
//   {
//     expiresIn: "7d",
//   },
// );
// res.cookie("accesstoken", accessToken, {
//   maxAge: 15 * 60,
//   httpOnly: true,
// });
// res.cookie("refreshtoken", refreshToken, {
//   maxAge: 7 * 24 * 60 * 60,
//   httpOnly: true,
// });

export default router;
