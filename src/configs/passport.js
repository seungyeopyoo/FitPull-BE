import passport from "passport";
import KakaoStrategyModule from "passport-kakao"
import { findOrCreateSocialAccount } from "../services/auth.service.js"; 
import GoogleStrategyModule from "passport-google-oauth20";

const KakaoStrategy = KakaoStrategyModule.Strategy || KakaoStrategyModule.default;

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateSocialAccount(profile, "KAKAO");
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
  )
);

passport.use(
  new GoogleStrategyModule(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialAccount(profile, "GOOGLE");
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
