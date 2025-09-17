import passport from '../libs/passport/index.js';

export const optionalAuthenticate = (req, res, next) => {
  passport.authenticate('access-token', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
