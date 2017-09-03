var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var collection;
var cursor;
var url = 'mongodb://localhost:27017/xpressLocalAuth';
var autoIncrement = require("mongodb-autoincrement");

function getItems(theme){
    return MongoClient.connect(url)
        .then(function (db, err) {
            if (err) {
                throw err;
            }
            console.log("Connected correctly to server");

            collection = db.collection(theme);

            cursor = collection.find({"name": theme});
            return cursor.toArray();
        }).then(function (doc, err) {
            if (err) {
                throw err;
            }
            return doc[0].items;

        }).catch(function (err) {
            console.log(err);
        })
}

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

            console.log(doc.count);

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            MongoClient.connect(url, function (err, db) {
                autoIncrement.getNextSequence(db, theme, function (err, autoIndex) {
                    var collection = db.collection(theme);
                    collection.updateOne({"name": theme},{
                        $push: {
                            "items": {
                                id: autoIndex,
                                title: head,
                                date: dateStr,
                                path: theme + "/" + autoIndex + '.ejs',
                                status: "draft"
                            }
                        }
                }, function (err) {
                        if (err)
                            throw err;
                        console.log('entry updated');
                    });

                    collection.updateOne({"name": theme}, {$set: {"lastid": autoIndex}}, function (err) {
                        if (err)
                            throw err;
                        console.log('entry updated');
                    });

                    var fs = require('fs');
                    fs.writeFile(theme + '/' + autoIndex + '.ejs', data, 'utf8');
                });
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

function writeProposals(data) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection("proposals");

        cursor = collection.find({"name": "proposals"});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc == null)
                return;

            console.log(doc.count);

            var date = new Date();
            var dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            MongoClient.connect(url, function (err, db) {
                autoIncrement.getNextSequence(db, "proposals", function (err, autoIndex) {
                    var collection = db.collection("proposals");
                    collection.updateOne({"name": "proposals"},{
                        $push: {
                            "items": {
                                id: autoIndex,
                                name: data.name,
                                company: data.company,
                                email: data.email,
                                phone: data.phone,
                                message: data.message,
                                fileName: data.fileName,
                                date: dateStr
                            }
                        }
                    }, function (err) {
                        if (err)
                            throw err;
                        console.log('entry updated');
                    });

                    collection.updateOne({"name": "proposals"}, {$set: {"lastid": autoIndex}}, function (err) {
                        if (err)
                            throw err;
                        console.log('entry updated');
                    });

                    // var fs = require('fs');
                    // fs.writeFile(theme + '/' + autoIndex + '.ejs', data, 'utf8');
                });
            });

            collection.updateOne({"name": "proposals"}, {$set: {"count": doc.count + 1}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            collection.updateOne({"name": "proposals"}, {$set: {"lastupd": dateStr}}, function (err) {
                if (err)
                    throw err;
                console.log('entry updated');
            });

            db.close();
            return false;
        });
    });
}

function getNews(theme, id) {
    return MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth')
        .then(function (db, err) {
            if (err) {
                throw err;
            }
            datbas = db;
            console.log("Connected correctly to server");
            collection = db.collection(theme);
            cursor = collection.find({"name": theme});
            return cursor.toArray();
        }).then(function (doc, err) {
            if (err) {
                throw err;
            }
            datbas.close();
            console.log('id='+id);
            if (id == null) {

                var themes = [];
                for (var i = 0; i < doc[0].items.length; i++){
                    if (~doc[0].items[i].status.indexOf("published")){
                        themes.push(doc[0].items[i]);
                    }
                }
                return themes;

            } else {
                return doc[0].items.find(function(element, index, array) {
                    if(element.id === parseInt(id)) {
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
                    doc.items[i].status = 'draft';
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
            if (doc === null)
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

function publishRaws(items, theme) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection(theme);

        cursor = collection.find({"name": theme});
        cursor.each(function (err, doc) {
            if (err)
                throw err;
            if (doc === null)
                return;

            console.log(doc.count);

            for (var i = 0; i < items.length; i++) {
                for (var j = 0; j < doc.items.length; j++) {
                    if (parseInt(doc.items[j].id) === parseInt(items[i])) {
                        doc.items[j].status = 'published';
                    }
                }
            }

            collection.updateOne({"name": theme}, {$set: {"items": doc.items}}, function (err) {
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

function getTitle(theme, num) {
    return MongoClient.connect(url)
        .then(function (db, err) {
            if (err) {
                throw err;
            }
            console.log("Connected correctly to server");
            collection = db.collection(theme);
            cursor = collection.find({"name": theme});
            return cursor.toArray();
        }).then(function (doc, err) {
            if (err) {
                throw err;
            }

            for (var i = 0; i < doc[0].items.length; i++) {
                if (parseInt(doc[0].items[i].id) === parseInt(num)) {
                    return doc[0].items[i].title;
                }
            }

        }).catch(function (err) {
            console.log(err);
        })
}

function checkDatabase(theme) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection(theme);


        cursor = collection.find({"name" : theme});
        cursor.each(function (err, doc) {

            try {
                if (doc.count > -1){
                    return false;
                }
            }

            catch(e) {
                db.createCollection(theme, function (err, res) {
                    console.log("Collection created!");

                    res.insertOne({
                        "name": theme,
                        "lastupd": null,
                        "count": 0,
                        "number": 218,
                        "lastid": -1,
                        "items": []
                    });
                });
                return true;
            }
        });
        return false;
    });
}

function getApplies() {
    return MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth')
        .then(function (db, err) {
            if (err) {
                throw err;
            }
            datbas = db;
            console.log("Connected correctly to server");
            collection = db.collection('proposals');
            cursor = collection.find({"name": 'proposals'});
            return cursor.toArray();
        }).then(function (doc, err) {
            if (err) {
                throw err;
            }
            datbas.close();

            return doc[0].items;
        });
}

module.exports = {
    getNewsNumber : getNewsNumber,
    writeNews : writeNews,
    writeProposals: writeProposals,
    getNews : getNews,
    updateRaw : updateRaw,
    deleteRaws : deleteRaws,
    getItems : getItems,
    getTitle : getTitle,
    checkDatabase : checkDatabase,
    publishRaws : publishRaws,
    getApplies : getApplies
};