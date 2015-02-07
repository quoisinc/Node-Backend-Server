module.exports = function(app, db, express) {

  var routes = require('./routes')(db)
      , path = require('path')
      , public_directory = path.join(__dirname, 'public');
    
  app.use( require( 'less-middleware' )( { src: public_directory } ) );
  app.use( express.static( path.join( public_directory ) ) );

  app.get('/tags/', routes.index);//index page
  
  app.get('/tags/getTags', routes.getTags);//retrieving all tags(generic)
  app.post('/tags/postTags', routes.postTags);//posting all tags(generic)
  
  //app.get('/tags/getTags/:collectionName/:id', routes.getTagsByCollection);//retrieve tags by collection
  app.all('/tags/getTags/:collectionName/:id', routes.getTagsByCollection);

  //app.post('/tags/postTags/:collectionName', routes.postTagsByCollection);//posting tags by collection
  app.all('/tags/postTags/:collectionName', routes.postTagsByCollection);//posting tags by collection

  //app.put('/tags/updateTags/:collectionName/:id', routes.updateTagsByCollection);//update tags by collection
  app.all('/tags/updateTags/:collectionName/:id', routes.updateTagsByCollection);//update tags by collection

  //app.delete('/tags/deleteTags/:collectionName/:id', routes.deleteTagsByCollection);//delete tags by collection
  app.all('/tags/deleteTags/:collectionName/:id', routes.deleteTagsByCollection);//delete tags by collection
}; 