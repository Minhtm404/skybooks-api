const express = require('express');
const morgan = require('morgan');
const path = require('path');

const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.url} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
