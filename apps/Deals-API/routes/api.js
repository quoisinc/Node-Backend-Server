module.exports = function(db) {
  
  var request = require('request');

  var api = {};

  api.deals = function(req, res) {
      res.header("Access-Control-Allow-Origin", "*");
      
      var qs = req.query
        , limit = parseInt(qs.MaxLowestDeals) || 6
        , return_obj = []
        , select_sentence = {};

      if (typeof limit !== 'number') {
        var limit_error_message = 'Limit is not a number';
        
        console.log(limit_error_message);
        res.json({error: limit_error_message});
        
        return;
      }
      console.log('Is new service ->' + qs.IsNewService);
      
      select_sentence['IsNewService'] = false;
      
      if (qs.IsNewService)
        select_sentence['IsNewService'] = true;

      if (qs.Origin)
        select_sentence['Origin.AirportCode'] = qs.Origin;

      if (qs.Destination)
        select_sentence['Destination.AirportCode'] = qs.Destination;

      console.log('Getting Data for -> From:' 
        + qs.Destination + ' To: -> ' + qs.Origin);

      select_sentence['Fare.FareType'] = (qs.MaxLowestDeals === '0') 
        ? 'LOWEST/POINTS' : 'LOWEST/PRICE';

        var new_limit = null;

        if (qs.MaxTrueBlueDeals)
          new_limit = parseInt(qs.MaxTrueBlueDeals)
          
        if (typeof new_limit === 'number' && 
          new_limit > 0)
          limit = new_limit;
      
      console.log('--- > Select sentence is here!');
      console.log(select_sentence);
      console.log('--- > Select sentence is here!');

      db.collection('deals', function(err, collection) {
          collection
            .find(select_sentence)
            .limit(limit)
            .toArray(function(err, items) {
              res.json(items);
          });
      });

    };

    api.proxy_geo = function(req, res) {
      res.setHeader("Access-Control-Allow-Origin","*");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      
      request.post({
        url       : 'URL/JBES/v1_0/ODService_v1_1/ODService.svc/json/GetNearbyAirports',
        headers   : { 'Content-Type' : 'application/json' },
        body      : JSON.stringify(req.query)
      }, function(e, r, b) {
        
        res.json(JSON.parse(b))
      });
    };


  return api;
}