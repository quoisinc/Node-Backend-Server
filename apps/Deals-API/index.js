module.exports = function(app, db) {

  var API = require('./routes/api')(db);
  
  app.get('/deals', API.deals);
  app.options('/proxy-geo', API.proxy_geo);
  app.get('/proxy-geo', API.proxy_geo);  

};