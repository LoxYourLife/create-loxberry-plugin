process.env.NODE_ENV = 'development';

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const logger = require('./lib/Logger')('Express');
const path = require('path');
const exphbs = require('express-handlebars');
const { onUpgrade, addWsToRouter } = require('./lib/webSocket');
const _ = require('lodash');

const createServer = async () => {
  const app = express();

  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization'
    );
    next();
  });

  app.use(fileUpload({ createParentPath: true }));
  app.use(bodyParser.json());
  app.engine(
    '.hbs',
    exphbs({
      extname: '.hbs',
      layoutsDir: path.resolve(__dirname, 'views/layouts')
    })
  );
  app.set('view engine', '.hbs');

  app.set('views', [path.resolve(__dirname, 'views'), path.resolve(__dirname, '../webfrontend/htmlauth/views')]);
  const module = require(path.resolve(__dirname, '../webfrontend/htmlauth/express.js'));
  const plugin = module({
    router: addWsToRouter(express.Router()),
    static: express.static,
    logger: logger,
    _
  });
  app.use('/', plugin);
  app.use('/', express.static(path.resolve(__dirname, '../webfrontend/htmlauth/')));

  app.get('*', (req, res, next) => {
    if (req.ws) return next();
    logger.info(`ACCESS 404 ${req.method} ${req.url}`);
    res.status(404);
  });

  const server = app.listen(3000, '0.0.0.0', () => {
    logger.info(`LoxBerry Express Server listening at http://localhost:3000`);
  });

  server.on('upgrade', onUpgrade(app));
};

createServer();
