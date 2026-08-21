import { prisma } from "../prismaInstance";
import { Request, Response, NextFunction } from "express";

export async function userSignupValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userData = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (existingUser) {
      res.status(409).json({ msg: "User already exist." });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    return;
  }
}

export async function userLoginValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.body;
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!existingUser) {
    res.status(404).json({ msg: "No user found" });
    return;
  }
  next();
}
