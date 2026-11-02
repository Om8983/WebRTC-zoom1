import type { CookieOptions, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

const sharedCookieOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

const accessTokenCookieOptions: CookieOptions = {
  ...sharedCookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...sharedCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function setAccessTokenCookie(res: Response, token: string) {
  res.cookie("accesstoken", token, accessTokenCookieOptions);
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  setAccessTokenCookie(res, accessToken);
  res.cookie("refreshtoken", refreshToken, refreshTokenCookieOptions);
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accesstoken", sharedCookieOptions);
  res.clearCookie("refreshtoken", sharedCookieOptions);
}
