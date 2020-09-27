const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const express = require('express');
const app = express();


app.use(cors());
app.use(morgan('dev'));
require('./bootstrap/log')();
require('./bootstrap/db')();
require('./bootstrap/routes')(app);
require('./bootstrap/config')();
require('./bootstrap/validation')();

const port = process.env.PORT || 4000;
app.listen(port, () => winston.info(`Listening to port ${port}`));