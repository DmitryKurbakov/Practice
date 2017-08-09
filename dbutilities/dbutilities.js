
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var newsID;

var collection;
var cursor;
var url = 'mongodb://localhost:27017/xpressLocalAuth';

function getNewsNumber() {

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name" : "news"});
        cursor.each(function(err, doc) {
            if(err)
                throw err;
            if(doc == null)
                return;

            db.close();
            return doc.number;
        });
    });
}

function writeLastID(data) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name" : "news"});
        cursor.each(function(err, doc) {
            if(err)
                throw err;
            if(doc == null)
                return;

            db.close();
            console.log(doc.count);
            var fs = require('fs');
            fs.writeFile('news/' + doc.count + '.html', data , 'utf8');
            return false;
        });
    });
}

function updateLastID() {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name" : "news"});
        cursor.each(function(err, doc) {
            if(err)
                throw err;
            if(doc == null)
                return;

            collection.updateOne({"name" : "news"}, {$push: {"items" : {id: doc.count, title: "KOSTYL", path: "news/" + doc.count + '.html'}}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name" : "news"}, {$set: {"count" : doc.count + 1}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            collection.updateOne({"name" : "news"}, {$set: {"lastupd" : dateStr}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });
        });
    });
}

module.exports = {
  getNewsNumber: getNewsNumber,
  writeLastID: writeLastID,
  updateLastID: updateLastID,
};