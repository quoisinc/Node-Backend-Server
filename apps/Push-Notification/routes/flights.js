/* Web Pages */

module.exports= function(io, db) {
  
  var parseString = require('xml2js').parseString
    , fs = require('fs')
    , path = require('path');

  var current_file_list = []
    , log_directory = "z:\\Production\\URL.FSN.15Below\\debug\\"
    , view_path = path.join( __dirname, '../views/');

  var routes = {};

  try {
    fs.watch(log_directory, function (event, filename) {
     
      if (current_file_list.length > 100
          && event === "rename")
        current_file_list = [];
      
      if (current_file_list.indexOf(filename) > -1)
        return;

       if (filename)
        current_file_list.push(filename);
    
      fs.readFile(log_directory + filename, {
          encoding: "utf-8"
        }, function(err, data){
            if (typeof data === "undefined") {
              console.log('data undefined');
              return;
            }
            data = data.replace("\ufeff", "");
            
            parseString(data, function (err, result) {
              try {

                var flight_information = {};
                if (typeof result['ns0:NewFlightTrigger'] === "undefined")
                  return;
                
                if (err) {
                  console.log(err);
                  return;
                }
                console.log("====================\n");
              
                flight_information = {
                  flight_number : result['ns0:NewFlightTrigger']['ns0:flightStatus'][0]['ns3:FlightInformation'][0]['ns3:FlightNumber'][0],
                  departure_date : result['ns0:NewFlightTrigger']['ns0:flightStatus'][0]['ns3:FlightInformation'][0]['ns3:DepartureDate'][0],
                  status: result['ns0:NewFlightTrigger']['ns0:flightStatus'][0]['ns3:FlightInformation'][0]['ns3:Status'][0]
                }
                console.log("\nFilename is -> " + filename);
                console.log("\n");
                console.log(flight_information);
                console.log("\n");
                console.log("====================\n\n");
              } catch (e) {
                console.log(e);
                return;
              }

              get_all_sids(flight_information);
              
            });
      });

    });
  } catch (err) {
    console.log(err);
  }

(function(){

  var gate = true;
  process.argv.forEach(function (val, index, array) {
    if(val === 'fake-server')
      gate = false;
  });

  if (gate)
    return;
  
  console.log('\n========================');
  console.log('Fake FSN Server enabled.');
  console.log('========================\n');

  setInterval(function(){
    
    var all_status = [
      'On Time',
      'Boarding',
      'Taxiing',
      'Departed',
      'Landed',
      'Delayed'
    ]
    , dummy_flight_numbers = [
      '1125',
      '6178',
      '777',
      '3265',
      '787'
    ];

    get_all_sids({
      flight_number:dummy_flight_numbers[getRandomInt(0,dummy_flight_numbers.length-1)],
      status: all_status[getRandomInt(0,all_status.length-1)]
    });
  }, 13000);
})();

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function get_all_sids(data) {
    var flight_number = data.flight_number;
    
    console.log("Sending data to all online user with SID subscribed to flight number -> " + data.flight_number);
    
    db.collection('subscriptions', function(err, collection) {
      collection.find({
        flights: {
          $elemMatch: {
            number: flight_number 
          }
        }
      })
      .toArray(function(err, items) {
        
        var online_users = io.of('/flights').clients();

        console.log("\nUsers connected -> " + online_users.length);

        for (var y = 0; y < online_users.length; y++) {
          if (!online_users[y].handshake.SID) {
            console.log('NO SID ???!!?!');
            online_users[y].emit('request_sid', {});
            continue;
          }
          
          var SID = online_users[y].handshake.SID;
          
          for (var x = 0; x < items.length; x++) {
              // console.log("Looping through mongo IDS");
              var online_SID = items[x]._id.toString();

              if (online_SID === SID) {
                console.log('Sending to online user with SID -> ' + SID );
                online_users[y].emit('flight_change', data);
              }
              
          }
        }
        
      });
    }); 
  }
  
  routes.flights = function(req, res){
    
    res.render(view_path + 'flights', { 
      title: 'Flight Events',
      body_class: "flight-status"
    });
  }

  routes.index = function(req, res){
    res.render(view_path + 'index', { 
      title: 'Express',
      body_class: "homepage"
    });
  };
  
  return routes;
};