var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var collection;
var cursor;
var url = 'mongodb://localhost:27017/xpressLocalAuth';

function getNewsNumber() {

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name": "news"});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc == null)
                return;

            db.close();
            return doc.number;
        });
    });
}

function writeNews(data, head, theme) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection(theme);

        cursor = collection.find({"name": theme});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc == null)
                return;

            var lastid = doc.lastid + 1;
            collection.updateOne({"name": theme}, {$set: {"lastid": lastid}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });
            console.log(doc.count);
            var fs = require('fs');
            fs.writeFile(theme + '/' + lastid + '.ejs', data, 'utf8');


            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            collection.updateOne({"name": theme}, {
                $push: {
                    "items": {
                        id: lastid,
                        title: head,
                        date: dateStr,
                        path: theme + "/" + lastid + '.ejs',
                        status: "draft"
                    }
                }
            }, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name": theme}, {$set: {"count": doc.count + 1}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name": theme}, {$set: {"lastupd": dateStr}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            db.close();
            return false;
        });
    });
}

function getNews(id) {
    return MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth')
        .then(function (db, err) {
            if (err) {
                throw err;
            }
            datbas = db;
            console.log("Connected correctly to server");
            collection = db.collection('news');
            cursor = collection.find({"name": "news"});
            return cursor.toArray();
        }).then(function (doc, err) {
            if (err) {
                throw err;
            }
            datbas.close();
            console.log('id='+id);
            if (id == null) {
                return doc[0].items;
            } else {
                return doc[0].items.find(function(element, index, array) {
                    if(element.id == id) {
                        return element;
                    }
                });
            }
        }).catch(function (err) {
            console.log(err);
        })
}

function updateRaw(id, data, head, theme) {

    var fs = require('fs');
    fs.writeFile(theme + '/' + id + '.ejs', data, 'utf8');

    MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth', function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection(theme);

        cursor = collection.find({"name": theme});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc == null)
                return;

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            for (var i = 0; i < doc.items.length; i++) {
                if (doc.items[i].id === parseInt(id)) {

                    doc.items[i].title = head;
                    doc.items[i].date = dateStr;
                }
            }


            collection.updateOne({"name": theme}, {$set: {"items": doc.items}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name": theme}, {$set: {"lastupd": dateStr}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });
        });
    });

}

function deleteRaws(items, theme) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection(theme);

        cursor = collection.find({"name": theme});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc == null)
                return;

            console.log(doc.count);

            var fs = require('fs');

            for (var i = 0; i < items.length; i++) {
                for (var j = 0; j < doc.items.length; j++) {
                    if (parseInt(doc.items[j].id) === parseInt(items[i])) {
                        doc.items.splice(j, 1);
                        fs.unlinkSync(theme + '/' + items[i] + '.ejs');
                        console.log('deleted');
                    }
                }
            }


            collection.updateOne({"name": theme}, {$set: {"items": doc.items}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name": theme}, {$set: {"count": doc.items.length}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            collection.updateOne({"name": theme}, {$set: {"lastupd": dateStr}}, function (err) {
                if (err)
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
    getNews: getNews,
    updateRaw: updateRaw,
    deleteRaws: deleteRaws
};