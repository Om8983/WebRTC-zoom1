import { Request, Response } from "express";
import { prisma } from "../../prismaInstance";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function signup(req: Request, res: Response) {
  /* first we we'll get the user data
  we will have a middleware that will be responsible for checking the body schema types 
  if schema validation succeeds then we will check if the user is existing if it is then we will throw status respectively
  if user doesn't exist we will go on creating account
  steps ::
    -> hash the password
    -> store the user in db
    -> generate tokens
    -> assign cookies
    -> return response
  */
  try {
    const userData = req.body;
    // hash the password since all the validation for existing user and schema is already handled by middlewares we can securely proceed further for creatin password hash and generating tokens and assign it to user
    const saltRounds = 12;
    const hashedPass = await bcrypt.hash(userData.password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPass,
        userName: userData.userName,
      },
      select: {
        email: true,
        id: true,
      },
    });

    const accessToken = jwt.sign(
      {
        id: newUser.id,
        email: userData.email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.ACCESTOKEN_SECRET ?? "",
      {
        expiresIn: "15min",
      },
    );
    const refreshToken = jwt.sign(
      {
        id: newUser.id,
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
    res.status(200).json({ msg: "User signup success." });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    return;
  }
}
export async function login(req: Request, res: Response) {
  // first we will extract the user email and password
  // -> if no email || pass return
  // second we will check if its an existing user
  // -> if not then return
  // third we will check if the password is correct
  // -> if not then return with. a 401 user unauth
  // fourth if user is existing and passoword is valid
  // -> assign an access and a refresh token to the user
  // -> attach those tokens in cookies
  // return the response
  try {
    const userData = req.body;

    if (!userData) {
      return res.status(400).json({ msg: "Invalid Input" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    const validatePass = await bcrypt.compare(
      userData?.password,
      user?.password ?? "",
    );
    if (!validatePass) {
      return res.status(401).json({ msg: "Invalid Password" });
    }
    const accessToken = jwt.sign(
      {
        id: user?.id,
        email: user?.email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.ACCESSTOKEN_SECRET ?? "",
      {
        expiresIn: "15min",
      },
    );
    const refreshToken = jwt.sign(
      {
        id: user?.id,
        email: user?.email,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.REFRESHTOKEN_SECRET ?? "",
      { expiresIn: "1d" },
    );

    res.cookie("accesstoken", accessToken, {
      maxAge: 15 * 60,
      httpOnly: true,
    });

    res.cookie("refreshtoken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
    });

    res.status(200).json({ msg: "Success" });
    return;
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}
