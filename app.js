const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const passport = require('passport');


const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
// Database connection
db.connectDatabase();

// Routes
const index = require('./routes/index');
const student = require('./routes/student');
const book = require('./routes/book');
const chapter = require('./routes/chapter');
const auth = require('./routes/auth');
const teacher = require('./routes/teacher');
const classes = require('./routes/classgroup')

app.use('/', index);
app.use('/student', student);
app.use('/book', book);
app.use('/chapter', chapter);
app.use('/auth', auth);
app.use('/teacher', teacher);
app.use('/classgroup', classes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;