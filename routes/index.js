
/*
 * GET home page.
 */
module.exports= (function() {

  var routes = {};

  routes.index = function(req, res){
    res.render('index', { 
      title: 'Web 3.0 UI',
      body_class: "welcome"
    });
  };

  return routes;
})();
