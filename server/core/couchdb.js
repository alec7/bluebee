exports.module = function(){
	
	/*How it looks like:

	Collections:
		type: "collection",
		name: "name",
		application: "system"
		user: userId,
		rights: 
			{
				users: 
					{
						userId: 
							{
								create: true,
								read: true,
								update: true,
								delete: true,
							},
						userId: 
							{
								create: true,
								read: true,
								update: true,
								delete: true,
							},
						rest:
							{
								create: false,
								read: false,
								update: false,
								delete: false,
							}
					},
				groups: 
					{
						groupId: 
							{
								create: false,
								read: false,
								update: false,
								delete: false,
							},
						groupId:
							{
								create: false,
								read: false,
								update: false,
								delete: false,
							}
					},
				rest:
					{
						create: false,
						read: false,
						update: false,
						delete: false,
					}
			},
		subs: [ userID, userID, userID ],

	Models:
		type: "model",
		name: "name",
		application: "system"
		user: userId,//From the collection
		owner: userId
		group: groupId,
		subs: [ userID, userID, userID ],
		content: {}
	*/

	var http = require( "http" );

	////-----------------------------------------------------------------------------------------
 	//The Constructor
	this.main = function( cb ){
		bb.core.couchdb.databaseExists( bb.conf.couchdb.database, function( err, result ){
			if( err ){
				log( "CouchDB: " + err, "error" );
			} else if ( !result ){ 
				log( "Database " + bb.conf.couchdb.database + " doesn't exist" )
			} else {
				cb();
			}
		});
	}

	////-----------------------------------------------------------------------------------------
 	//Makes the installation
	this.install = function( cb ){
		bb.core.couchdb.databaseExists( bb.conf.couchdb.database, function( err, result ){
			if( err ){
				log( "CouchDB: " + err );
				log( "Stopping installation" );
			} else {
				if( result ){
					cb();
				} else {
					log( "Database " + bb.conf.couchdb.database + " doesn't exist", "prompt" );
					log( "If you fixed this, try installing installing bluebee again" );
				}
			}
		});
	}

	////-----------------------------------------------------------------------------------------
 	//Abstract method for checking if database is their
	this.databaseExists = function( name, cb){
		bb.core.couchdb.makeRequest( name, "GET", null, function( err, res ){
			if( err ){
				cb( err, false );
			} else {
				if( res.error ){
					cb( res.error, false );
				} else {
					cb( null, true );
				}
			}
		});
	}

	////-----------------------------------------------------------------------------------------
 	//Makes the real requests to the database
	this.makeRequest = function( uri, method, body, cb ){
		var options = {
			host: bb.conf.couchdb.host,
			port: bb.conf.couchdb.port,
			path: "/" + uri,
			method: method
		};

		var req = http.request(options, function(res) {
//			console.log('STATUS: ' + res.statusCode);
//			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding( "utf8" );
			var content = "";
			res.on( "data", function ( chunk ) {
				content += chunk;
			});

			res.on( "end", function(){
				var parsedContent
				try{
					parsedContent = JSON.parse( content );
				} catch( err ){
					cb( err, content );
					return;
				}
				cb( null, parsedContent );

			});
		});

		req.on( "error", function( err ) {
			cb( err.message, null );
		});

		if( method == "POST" ){
			// write data to request body
			/*req.write('data\n');
			req.write('data\n');*/
		}	
		req.end();
	}
};
