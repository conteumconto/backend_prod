const passport = require('passport'),
  Person = require('../models/Person'),
  config = require('./main'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;


module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, (payload, done) => {
    Person.findOne({
        login: payload._doc.login,
      })
      .then((person) => {
        if (person) {
          done(null, person);
        } else {
          done(null, false);
        }
      })
      .catch((err) => {
        if (err) {
          return done(err, false);
        }
      });
  }));
};