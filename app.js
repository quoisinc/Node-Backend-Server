
/**
 * Module dependencies.
 */
var M_ADDRESS = process.env.M_ADDRESS || 'localhost'
  , M_DB = process.env.M_DB || 'flightapp'
  , M_PORT = process.env.M_PORT || 27017;

//Mongo Instance
var mongodb = require('mongodb')
  , mongo_server = new mongodb.Server(M_ADDRESS, M_PORT, {auto_reconnect: true})
  , db = new mongodb.Db(M_DB, mongo_server, {w:1});

console.log("=======DB INFO===========");
//console.log("IP: "+process.env.M_ADDRESS);
console.log("Mongo Server is " + M_ADDRESS);
console.log("Mongo Database is " + M_DB);
console.log("Mongo Port is " + M_PORT);
console.log("=========================");

db.open(function (err, client) {
  db.authenticate('', '', function (err, replies) {
    if (err) 
      console.log(err);
    else
      console.log('Database Connected');  
  });
});

//Express
var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('Very COmpleX S3cr3tz 1337'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
  })
  , io = require('socket.io').listen(server)
  , routes = require('./routes');


io.configure(function (){
  io.set('log level', 1);
  io.set('authorization', function (handshakeData, callback) {

    var query = handshakeData.query
      , SID_object_ID = null;

      if (!query.SID) {
        console.log('No SID provided');
        callback(null, true);
        return;
      }
       

      try {
        SID_object_ID = mongodb.ObjectID(query.SID);
      } catch (e) {
        console.log(e);
        console.log(query.SID);
        callback(null, true);
        return;
      };

    db.collection('subscriptions', function(err, collection) {
      collection.findOne({_id: SID_object_ID}, function(err, item) {

        if (err) {
          console.log(err);
          callback(null, true);
          return;
        }

        if (item !== null )
          handshakeData.SID = item._id.toString();

        callback(null, true); 
      });
    });

  });
});

/* Load apps */
require('./apps/Push-Notification')(app, db, io, express);
require('./apps/Deals-API')(app, db);
require('./apps/Dynamic-Tags')(app, db, express);

app.get('/', routes.index);