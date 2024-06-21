// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const httpContext = require('express-http-context')

const routes = require('./api/routes/v1')

const app = express()

app.disable('x-powered-by')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(
  cors({
    // TODO: Change this wildcard by the allowed origins.
    origin: '*',
    optionsSuccessStatus: 200,
  }),
)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(httpContext.middleware)

// v1 api routes
app.use('/v1', routes)

// Health check endpoint
app.use('/health', (req, res) => {
  res.status(200).send('OK')
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  const status = err.status || 500

  res.status(status).send({ status, errorMessage: err.message || 'Unknown' })
})

module.exports = app
