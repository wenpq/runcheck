
module.exports = function (app) {
  app.get('/user/', function(req, res, next) {
    res.send('respond with a resource');
  });
};

