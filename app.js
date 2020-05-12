require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const expressip = require('express-ip');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');

const app = express();

app.use(cors());
app.use(expressip().getIpInfoMiddleware);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// render routes
app.use('/api', apiRoutes);
app.use('/webhooks', webhookRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.sendStatus(err.status || 500);
  // res.render('error');
});

module.exports = app;
