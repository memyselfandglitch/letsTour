const express = require('express');
const morgan = require('morgan');
const path=require('path');
const pug=require('pug');
const rateLimit=require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter=require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

app.use(helmet());
// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({limit:'10kb'}));

//data santize against query inj
app.use(mongoSanitize());

//xss sanitise
app.use(xss());

//parameter polution
app.use(hpp({
  whitelist:['duration']
}));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  console.log(req.headers);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// const limiter=rateLimit({
//   windowMs:60*60*1000,
//   max:100
// })

// app.use(limiter);

// 3) ROUTES

app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

module.exports = app;
