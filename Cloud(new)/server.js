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
        dbo.collection('info').findOne({}, {sort:{$natural:-1}}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	//console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/devices', function(req, res, next) {
    mongo_client.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('devices').findOne({}, {sort:{$natural:-1}}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	//console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/header', function(req, res, next) {
    mongo_client.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err

        var dbo = db.db("mydb");
        dbo.collection('header').findOne({}, {sort:{$natural:-1}}, function(findErr, result) {
            if(findErr) throw findErr;
            else {
            	//console.log(result)
            	res.send(result)
            }
        })
    })
   
})

app.get('/deviceHistory/', function(req, res, next){
    mongo_client.connect('mongodb://localhost:27017', { useNewUrlParser: true }, function(err,db){
        if (err) throw err 

    var dbo = db.db("mydb");
        // dbo.collection('devices').aggregate([
        //             {
        //                     $group: 
        //                     {
        //                         _id : {pass: {pass: "$TC70.tests.0.pass"}, 
        //                         fail: {fail: "$TC70.tests.0.fail"}, 
        //                         time: {time: "$TC70.tests.0.time"} }, 
        //                         dups: {$addToSet: "$_id"}, 
        //                         count: {$sum: 1}
        //                     }
        //                 }, 
        //                 {
        //                     $match: 
        //                     {
        //                         count: {"$gt":1}
        //                     }

        //                 }
        //                 ]).forEach(function(doc) {
        //                     doc.dups.shift(); 
        //                     dbo.collection('header').remove({
        //                         _id: {$in:doc.dups}
        //                     })
        //                 })

                        

        dbo.collection('devices').find({}).sort([['_id', -1]]).toArray(function(findErr, result) {
            if(findErr) throw findErr;
            else {
                //console.log(result)
                res.send(result)
            }
        })
    })
})


app.get('/headerHistory/', function(req, res, next){
    mongo_client.connect('mongodb://localhost:27017', { useNewUrlParser: true }, function(err,db){
        if (err) throw err 

    var dbo = db.db("mydb");
        // dbo.collection('header').aggregate([
        //                 {
        //                     $group: 
        //                     {
        //                         _id : {time: {time: "$time"}, 
        //                         date: {date: "$date"}, 
        //                         timestamp: {timestamp: "$timestamp"} }, 
        //                         dups: {$addToSet: "$_id"}, 
        //                         count: {$sum: 1}
        //                     }
        //                 }, 
        //                 {
        //                     $match: 
        //                     {
        //                         count: {"$gt":1}
        //                     }

        //                 }
        //                 ]).forEach(function(doc) {
        //                     doc.dups.shift(); 
        //                     dbo.collection('header').remove({
        //                         _id: {$in:doc.dups}
        //                     })
        //                 })

        dbo.collection('header').find({}).sort([['_id', -1]]).toArray(function(findErr, result) {
            if(findErr) throw findErr;
            else {
                //console.log(result)
                res.send(result)
            }
        })
    })
})
