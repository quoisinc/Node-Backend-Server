module.exports= function(io, db) {

  var BSON = require('mongodb').BSONPure;
  
  var flights = io
      .of('/flights')
      .on('connection', function (socket) {

    console.log('Connected to Flights');
    
    if (!socket.handshake.SID)
      socket.emit('request_sid', {});

    io.of('/admin').emit('users_event', getUserList());
    
    socket.on('subscribe', function(data){
      console.log("User subscribing");

      var final_data = {
          flights: [{
            number: data.flight_number.toString(),
            date: data.date
          }]
      };

      db.collection('subscriptions', function(err, collection) {
        collection.insert(final_data, {safe:true}, function(err, result) {
         
          socket.emit("save_subscription", {
            subscription_id: result[0]._id
          });
          socket.handshake.SID = result[0]._id.toString();
          push_subscriptions(socket);
        
        });
      });
      
    }); //subscribe event

  socket.on('subcribe_to', function(data) {

      var SID = socket.handshake.SID
          , final_data = {
              number: data.flight_number.toString(),
              date: data.date
          }
          , BSON_ID = null;

      try {
        
        BSON_ID = new BSON.ObjectID(SID);

      } catch (e) {
        console.log(e);
        console.log(socket.handshake);
        return;
      }

      db.collection('subscriptions', function(err, collection) {
        collection.update({
          '_id': BSON_ID
        }, { $push: { flights : final_data } }, {safe:true}, function(err, result) {
            if (err) {
                console.log('Adding subscription to flight: ' + final_data.number + "\nBecause of error -> " + err);
            } else {
                if (result === 0) {
                  console.log('Invalid SID, sending kill event');
                  socket.emit('remove_sid', {});
                  
                  if (socket.handshake.SID)
                    delete(socket.handshake.SID);

                  return;
                }
                  

                console.log(final_data.number + " Added to -> " +  SID);
                socket.emit('subscrition_feedback', {
                  status: "success",
                  message: "flight_added"
                });
                push_subscriptions(socket);
            }
        });
      });
    }); //subcribe_to event
  
    socket.on('get_sid', function(data) {
      var SID = data;
      console.log('Receiving missing SID ->' + SID);
      if (SID == 'NO_SID_STORED') {
        console.log('Do something when the user does not has an SID stored in its browser');

        db.collection('subscriptions', function(err, collection) {
          collection.insert({flights:[]}, {safe:true}, function(err, result) {
           
            socket.emit("save_subscription", {
              subscription_id: result[0]._id
            });

            push_subscriptions(socket);
          });
        });
        return;
      }

      socket.handshake.SID = SID;
    }); // get_sid event

    socket.on('requesting_subscriptions', function(data){
      push_subscriptions(socket);
    }) // requesting_subscriptions event

    socket.on('disconnect', function () {
      console.log('DISCONNECTED');
      io.of('/admin').emit('users_disconnected', {SID: socket.handshake.SID});
    })

    function push_subscriptions(socket) {
      var SID = socket.handshake.SID
        , BSON_ID = null;

      try {
        
        BSON_ID = new BSON.ObjectID(SID);

      } catch (e) {
        console.log(e);
        console.log(socket.handshake);
        return;
      }
      
      db.collection('subscriptions', function(err, collection) {
        collection.findOne({_id: BSON_ID}, function(err, item) {
          console.log('Sending subscription to user -> ' + SID);
          if (item !== null 
            && typeof item !== 'undefined')
            socket.emit('your_subscriptions', item.flights);
          else
            socket.emit('your_subscriptions', []);
        });
      });
    }

    function getUserList() {
      var list = []
        , online_users = io.of('/flights').clients();

        for (var x = 0; x < online_users.length; x++)
          list[x] = {
            SID : online_users[x].handshake.SID
          }

      return list;
    }
  });
};