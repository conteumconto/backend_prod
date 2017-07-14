const express = require('express');

const apiRoutes = express.Router();
const Person = require('../models/Person');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

apiRoutes.post('/', (req, res) => {
  Person.findOne({
    login: req.body.login,
  }, (err, person) => {
    if (err) throw err;
    if (!person) {
      res.send({
        success: false,
        message: 'Authentication failed. Person not found.',
      });
    } else {
      // Check if password matches
      if (req.body.password == person.password) {
        const token = jwt.sign(person, config.secret, {
          expiresIn: 10080, // in seconds
        });
        // removed password
        person.password = undefined;
        person = JSON.parse(JSON.stringify(person));
        res.json({
          success: true,
          token: `JWT ${token}`,
          person
        });
      } else {
        res.send('Authentication failed. Invalid Password.');
      }
    }
  });
});


module.exports = apiRoutes;