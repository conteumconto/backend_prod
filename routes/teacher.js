const express = require('express');
const pjson = require('../package.json');
const Teacher = require('../models/Teacher');
const passport = require('passport');

require('../config/passport')(passport);

const protect = passport.authenticate('jwt', {
  session: false,
});

const router = express.Router();

/* GET resource and api info */
router.get('/', (req, res) => {
  const message = {
    resource: 'Teacher',
    version: pjson.version,
  };
  res.json(message);
});


/**
 * Resources
 */

router.get('/:login', protect, (req, res) => {
  //Find Teacher
  Teacher.find({
      login: req.params.login,
    })
    .then((teacher) => {
      //Token verification
      if ((req.user.login) == (req.params.login)) {
        res.json(teacher);
      } else {
        res.status(400);
        res.json({
          error: 'This token does not refer to this person.',
        });
      }
    }).catch(() => {
      res.status(404);
      res.end();
    });
});


router.post('/', (req, res) => {
  Teacher.create(req.body)
    .then(() => {
      res.status(201);
      res.end();
    }).catch((err) => {
      //error 11000 - duplication unique index in mongoose
      if (err.code == 11000) {
        if (err.errmsg.match(/email_1/)) {
          res.status(400);
          res.json({
            error: 'Duplicate email',
          });
        } else if (err.errmsg.match(/login_1/)) {
          res.status(400);
          res.json({
            error: 'Duplicate login',
          });
        }
      } else {
        //Others errors
        res.status(400).send(err);
      }
    });
});

router.delete('/:login', protect, (req, res) => {
  if ((req.user.login) == (req.params.login)) {
    Teacher.remove({
        login: req.params.login,
      })
      .then(() => {
        res.status(200);
        res.end();
      }).catch((err) => {
        // todo: refac erro handler
        res.json(err);
        res.status(400);
        res.end();
      });
  } else {
    res.status(400);
    res.json({
      error: 'This token does not refer to this person.',
    });
  }
});

router.put('/:login', protect, (req, res) => {
  //Token Verification
  if ((req.user.login) == (req.params.login)) {
    //Update
    Teacher.update({
        login: req.params.login,
      }, req.body)
      .then((teacher) => {
        res.status(200).end()
      }).catch((err) => {
        //error 11000 - duplication unique index in mongoose
        if (err.code == 11000) {
          if (err.errmsg.match(/email_1/)) {
            res.status(400);
            res.json({
              error: 'Duplicate email',
            });
          } else if (err.errmsg.match(/login_1/)) {
            res.status(400);
            res.json({
              error: 'Duplicate login',
            });
          }
        } else {
          //Others errors
          res.status(400).send(err);
        }
      });
  } else {
    res.status(400);
    res.json({
      error: 'This token does not refer to this person.',
    });
  }
});

module.exports = router;