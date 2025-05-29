import passport from "passport";
import KakaoStrategyModule from "passport-kakao"
import { findOrCreateSocialAccount } from "../services/auth.service.js"; 

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

export default passport;
