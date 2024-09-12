var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { google } = require('googleapis');
const fs = require('fs');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usersMove = require('./routes/move');
var AttackRouter = require('./routes/Attack_Card');
var DefenseRouter = require('./routes/Defense_Card');

var app = express();

//Google sheet
const KEYFILEPATH = path.join(__dirname, 'rival-war-a49295d4d376.json');
const SHEET_ID = '1bZxqPqHdWa7DOs0LxvIc1gXQ1ILv-fHmbemXWKL0Yro';
const RANGE = 'Card Attack!A1:D5';

// Cấu hình Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/move', usersMove);
app.use('/Attack_Card', AttackRouter);
app.use('/Defense_Card', DefenseRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
