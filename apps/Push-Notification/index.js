module.exports = function(app, db, io, express) {

  var path = require('path')
    , public_directory = path.join(__dirname, 'public');

  var flights = require('./routes/flights')(io, db)
    , socket_io = require('./routes/socket.io')(io, db)
    , admin = require('./routes/admin')(io, db);

  app.use( require( 'less-middleware' )( { src: public_directory } ) );
  app.use( express.static( path.join( public_directory ) ) );

  app.get('/push/', flights.index);
  app.get('/push/flights', flights.flights);
  app.get('/push/admin', admin.index);

};