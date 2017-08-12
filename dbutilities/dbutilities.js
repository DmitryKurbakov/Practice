
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

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

function writeNews(data, head) {
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

            var lastid = doc.lastid + 1;
            collection.updateOne({"name" : "news"}, {$set: {"lastid" : lastid}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });
            console.log(doc.count);
            var fs = require('fs');
            fs.writeFile('news/' + lastid + '.ejs', data , 'utf8');


            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            collection.updateOne({"name" : "news"}, {$push: {"items" : {id: lastid, title: head, date: dateStr, path: "news/" + lastid + '.ejs', status: "draft"}}}, function(err) {
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

            db.close();
            return false;
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

function updateRaw(id, data, head) {

    var fs = require('fs');
    fs.writeFile('news/' + id + '.ejs', data , 'utf8');

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

            doc.items[id].title = head;
            doc.items[id].date = dateStr;

            collection.updateOne({"name" : "news"}, {$set: {"items" : doc.items}}, function(err) {
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

function deleteRaws(items) {
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

            console.log(doc.count);

            var fs = require('fs');

            for (var i = 0; i < items.length; i++){
                for (var j = 0; j < doc.items.length; j++){
                    if (parseInt(doc.items[j].id) === parseInt(items[i])){
                        doc.items.splice(j, 1);
                        fs.unlinkSync('news/' + items[i] + '.ejs');
                        console.log('deleted');
                    }
                }
            }


           collection.updateOne({"name" : "news"}, {$set: {"items" : doc.items}}, function(err) {
                if(err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name" : "news"}, {$set: {"count" : doc.items.length}}, function(err) {
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
            db.close();
            return false;
        });
    });
}

module.exports = {
  getNewsNumber: getNewsNumber,
  writeNews: writeNews,
  getNewsItems: getNewsItems,
  updateRaw: updateRaw,
  deleteRaws: deleteRaws
};