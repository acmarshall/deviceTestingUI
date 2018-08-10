var express = require('express');
var app = express();
var port = 3002;
var mongo_client = require('mongodb').MongoClient;

app.listen(port, function() {
  console.log('app started');
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/info', function(req, res, next) {
    mongo_client.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('info').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/devices', function(req, res, next) {
    mongo_client.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('devices').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/header', function(req, res, next) {
    mongo_client.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('header').findOne({}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/deviceHistory/', function(req, res, next){
    mongo_client.connect('mongodb://localhost:27017', { useNewUrlParser: true }, function(err,db){
        if (err) throw err 

    var dbo = db.db("mydb");
        dbo.collection('devices').find({}).toArray(function(findErr, result) {
            if(findErr) throw findErr;
            else {
                console.log(result)
                res.send(result)
            }
        })
    })
})


app.get('/headerHistory/', function(req, res, next){
    mongo_client.connect('mongodb://localhost:27017', { useNewUrlParser: true }, function(err,db){
        if (err) throw err 

    var dbo = db.db("mydb");
        dbo.collection('header').find({}).toArray(function(findErr, result) {
            if(findErr) throw findErr;
            else {
                console.log(result)
                res.send(result)
            }
        })
    })
})
