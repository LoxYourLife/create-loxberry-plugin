const path = require('path');
module.exports = ({ router, expressStatic }) => {
  router.get('/', async (req, res) => {
    return res.render('index', { title: '{{plugin.name.title}}' });
  });

  router.use('/assets', expressStatic(path.resolve(__dirname, 'assets')));
  return router;
};
