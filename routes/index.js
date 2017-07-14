const express = require('express');
const pjson = require('../package.json');

const router = express.Router();

/* GET api version */
router.get('/', (req, res) => {
  res.json({ api: pjson.version });
});

module.exports = router;
