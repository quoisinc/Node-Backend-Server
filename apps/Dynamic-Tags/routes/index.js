module.exports = function(db) {
	var path = require('path')
		, tags = {};
	
	tags.index = function(req, res) {
		//res.send('Hello World');
    	res.render( path.join( __dirname, '../views/index' ), {
      		title 		: 'DYNAMIC TAGS',
      		body_class 	: "dyn-tag"
    	});
	};
	
	//Getting tags(generic)
	tags.getTags = function(req,res){};
	
	//Posting tags
	tags.postTags =function(req,res){
		console.log(req.body);
	};
	
	//Posting tags by collection
	tags.postTagsByCollection =function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
		 db.collection(req.params.collectionName, function(err, collection) {
			collection.insert(req.body, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred BEEP!'});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
				}
			});
		 });
	};
	
	//Retrieving tags by collection
	tags.getTagsByCollection = function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
        db.collection(req.params.collectionName,function(err, collection)
			{
			collection.findOne({
			_id: req.params.id
			}, function(err, result){
		    	//if (err) return next(err);
		    	console.log(result);
		    	if(!result){
		    		res.json({'status':'empty'});
		    	}else{
		    		//res.json();
		    		res.send(result);
		    	}
		    	
		    	//res.send(result);
		    });
		});
	};
	
	//updating tags by collection
	tags.updateTagsByCollection = function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
		db.collection(req.params.collectionName,function(err, collection)
			{
				collection.update({_id:req.params.id},req.body, {safe:true},function(err,result){
					if(err) {
						 console.log('Error updating tag collection: ' + err);
						 res.send({'error':'An error has occurred'});
					}else {
						console.log(''+result+' collection updated!');
						res.send(req.body);
					};
				});//end update
		});
	 };
	 
	 //deleting tags by collection
	tags.deleteTagsByCollection = function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
		db.collection(req.params.collectionName,function(err, collection){
			collection.remove({_id:req.params.id}, {safe:true}, function(err,result){
				if(err) {
					 res.send({'error':'An error has occurred - '+err});
				}else {
					console.log('' + result + ' collection deleted!');
					res.send(req.body);
				};
			});//ends remove
		});
	 };
	
	return tags;
};
