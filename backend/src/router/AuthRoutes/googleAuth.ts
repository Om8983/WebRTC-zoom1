import passport from "passport";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

require("./googleStrategy");

export const userScope = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const fallbackPath = passport.authenticate("google", {
  session: false,
  failureRedirect: "/api/v1/users/login",
});

type User = {
  id: string;
  email: string;
};

export const authFunction = async (req: Request, res: Response) => {
  try {
    const user = req?.user as User;

    // generate the access and refresh tokens. Attach expiry to it. Attach both the tokens to the response cookies. Redirect the user to the main dashboard page

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.ACCESTOKEN_SECRET ?? "",
      {
        expiresIn: "15min",
      },
    );
    const refreshToken = jwt.sign(
      {
        id: user.id,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.REFRESHTOKEN_SECRET ?? "",
      {
        expiresIn: "7d",
      },
    );
    res.cookie("accesstoken", accessToken, {
      maxAge: 15 * 60,
      httpOnly: true,
    });
    res.cookie("refreshtoken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
    });

    return res
      .status(200)
      .redirect(
        process.env.GOOGLE_LOGIN_REDIRECT_URL ??
          "http://localhost:5173/auth/login",
      );
  } catch (error) {}
};
