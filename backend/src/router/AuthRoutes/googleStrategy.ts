import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../../prismaInstance";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID ?? "",
      clientSecret: process.env.CLIENT_SECRET ?? "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, cb) => {
      try {
        const user = profile._json;

        //   checking if the user is existing. If it is then just attach the user to the cb fucntion
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email ?? "",
          },
          select: {
            id: true,
            email: true,
          },
        });
        if (existingUser) {
          return cb(null, existingUser);
        }

        //if user is not existing then just create a user and also create its googleid by extracting from the profile._json. Further just attach that user info to the callback function and return
        const newUser = await prisma.user.create({
          data: {
            email: user.email ?? "",
            googleId: user.sub ?? "",
            userName: user.name ?? "",
          },
          select: {
            id: true,
            email: true,
          },
        });

        return cb(null, newUser);
      } catch (error) {
        return cb(error);
      }
    },
  ),
);
