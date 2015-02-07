module.exports = function(io, db) {
  var path = require('path');
  var admin = {};

  admin.index = function(req, res) {

    res.render(path.join( __dirname, '../views/admin' ), { 
      title: 'Admin',
      body_class: "admin"
    });

  };

  var chat = io
  .of('/admin')
  .on('connection', function (socket) {
    console.log('Connected to admin');
  });

  return admin;
};