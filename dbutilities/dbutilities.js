
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

function writeNews(data) {
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

function updateLastID(head) {
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

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            collection.updateOne({"name" : "news"}, {$push: {"items" : {id: doc.count, title: head, date: dateStr, path: "news/" + doc.count + '.html', status: "draft"}}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name" : "news"}, {$set: {"count" : doc.count + 1}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name" : "news"}, {$set: {"lastupd" : dateStr}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });
        });
    });
}

function getNewsItems() {
    MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth', function(err, db) {
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
            return doc.items;
        });
    });
}

module.exports = {
  getNewsNumber: getNewsNumber,
  writeNews: writeNews,
  updateLastID: updateLastID,
  getNewsItems: getNewsItems
};