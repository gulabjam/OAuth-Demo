const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function configurePassport() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return false;
  }

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || 'Email unavailable',
        avatar: profile.photos?.[0]?.value || null
      });
    }
  ));

  return true;
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = { configurePassport };