const express = require('express');
const pjson = require('../package.json');
const Student = require('../models/Student');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/main');

require('../config/passport')(passport);

const protect = passport.authenticate('jwt', {
  session: false,
});

const router = express.Router();

/* GET resource and api info */
router.get('/', protect, (req, res) => {
  const message = {
    resource: 'Student',
    version: pjson.version,
  };
  res.json(message);
});


/**
 * Resources
 */

router.get('/:login', protect, (req, res) => {
  //Find Student
  Student.findOne({
      login: req.params.login,
    })
    .then((student) => {
      //Token verification
      if ((req.user.login) == (student.login)) {
        res.json(student);
      } else {
        res.status(400);
        res.json({
          error: 'This token does not refer to this person.',
        });
      }
    }).catch((err) => {
      // todo-> error handling@can't find student
      res.status(404);
      res.send(err);
    });
});


router.post('/', (req, res) => {
  Student.create(req.body)
    .then(() => {
      res.status(201);
      res.end();
    }).catch((err) => {
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
      }
      res.json(err);
      res.status(400);
    });
});

router.delete('/:login', protect, (req, res) => {
  //Find Student
  Student.remove({
      login: req.params.login,
    })
    .then(() => {
      //Token verification
      if (req.params.login == req.user.login) {
        res.status(200);
        res.end();
      } else {
        res.status(400);
        res.json({
          error: 'This token does not refer to this person.',
        });
      }
    }).catch((err) => {
      // todo: refac erro handler
      res.json(err);
      res.status(400);
      res.end();
    });
});

router.put('/:login', protect, (req, res) => {
  //Token verification
  if ((req.user.login) == (req.params.login)) {
    //Update
    Student.update({
        login: req.params.login,
      }, req.body)
      .then(() => {
        //Changed login
        if (req.body.login != req.user.login) {
          req.user.login = req.body.login
          let token = jwt.sign(req.user, config.secret, {
            expiresIn: 10080, // in seconds
          });
          res.status(200).json({
            token: `JWT ${token}`
          })
        } else {
          res.status(200);
          res.end();
        }
      }).catch((err) => {
        // todo: refac erro handler
        if (err) {
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