const usersRoutes = require('../api/routes/users');
const authRoutes = require('../api/routes/auth');
const instancesRoutes = require('../api/routes/instances');
const pinsRoutes = require('../api/routes/pins');
const activitiesRoutes = require('../api/routes/activities');
const readingsRoutes = require('../api/routes/readings');
const modulesRoutes = require('../api/routes/modules');
const aboutRoutes = require('../api/routes/meta');
const newsRoutes = require('../api/routes/news');
const devRoutes = require('../api/routes/dev');

const error = require('../api/middlewares/error');

const bodyParser = require('body-parser');

module.exports = (app) => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/instances', instancesRoutes);
    app.use('/api/pins', pinsRoutes);
    app.use('/api/readings', readingsRoutes);
    app.use('/api/activities', activitiesRoutes);
    app.use('/api/modules', modulesRoutes);
    app.use('/api/news', newsRoutes);
    app.use('/api/meta', aboutRoutes);
    app.use('/dev', devRoutes);
    app.use(error);
};