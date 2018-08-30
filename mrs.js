// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

var crypto = require('crypto');                      // verify request from slack is from slack with hmac-256
var querystring = require('querystring');            // Parse urlencoded body

module.exports.remember = function(event, context, callback) {
    var body = querystring.parse(event.body);        // Parse urlencoded body
    var response = {statusCode: 403};                // until request is authentically varified as from slack
    if(varify.request(event)){                       // make sure this request comes from slack
        mongo.handleRequest(body, function whenHandled(error, data){
            response = {
                statusCode: 200,
                headers: {'Content-type': 'application/json'},   // content type for richer responses beyound just text
            };
            if(error){
                response.body = JSON.stringify({'text' : error.name + ': ' + error.code});
            } else {
                if(data && body.channel_id === process.env.PRIVATE_VIEW_CHANNEL){ // Need to be in a specific channel in order to recieve results
                    response.body = JSON.stringify({'text' : 'recorded information for ' + body.text + '\n' + data});
                } else {
                    response.body = JSON.stringify({'text' : body.user_name + ' just recorded a note- ' + body.text});
                }
            }
            callback(null, response);
        });
    }
};

var mongo = {
    dbName: 'makerspace_testing',
    ObjectID: require('mongodb').ObjectID,
    client: require('mongodb').MongoClient,
    connectAndDo: function(connected, failed){         // url to db and what well call this db in case we want multiple
        mongo.client.connect(process.env.MONGO_URI, { useNewUrlParser: true }, function onConnect(error, client){
            if(error)      {failed(error);}     // what to do when your reason for existence is a lie
            else if(client){connected(client);} // passes client connection object so databasy things can happen
        });
    },
    handleRequest: function(body, onHandled){
        mongo.connectAndDo(function onConnect(client){ // if there is an error skip right to onStore function to hand error and respond
            var textArray = body.text.split(':');      // split arguments with colons
            var contact = body.text;  //.toLowerCase();
            var note = null;          // default to full text given no split
            console.log('length of arguments ' + textArray.length);
            if(textArray.length > 1){ // given we got two arguments split them into member and note fields
                contact = textArray[0];
                note = textArray[1];
                client.db(mongo.dbName).collection('notes').insertOne({
                    _id: new mongo.ObjectID(),
                    timestamp: new Date().getTime(),
                    nodeTakerId: body.user_id,
                    noteTaker: body.user_name,
                    forContact: contact, // this could be a current member, potential member, teacher, or community partner
                    note: note,
                    channelId: body.channel_id
                }, function whenDone(error, data){
                    onHandled(error, null);
                    client.close();
                });
            } else { // given just one argument is passed a search is assumed
                var cursor = client.db(mongo.dbName).collection('notes').find({forContact: contact});
                var collatedResult = '';
                mongo.stream(cursor, client, collatedResult, onHandled);
            }
        }, onHandled); // in fail to connect case pass onStore function to handle error
    },
    stream: function(cursor, client, collatedResult, onHandled){
        cursor.next(function onNote(error, doc){ // syncronously/recursively move through cursor results because we have nothing else todo
            if(doc){
                collatedResult += doc.note + '\n'; // collate relault to be returned
                mongo.stream(cursor, client, collatedResult, onHandled);
            } else {
                onHandled(error, collatedResult);
                client.close();
            }
        });
    }
};

var varify = {
    slack_sign_secret: process.env.SLACK_SIGNING_SECRET,
    request: function(event){
        var timestamp = event.headers['X-Slack-Request-Timestamp'];        // nonce from slack to have an idea
        var secondsFromEpoch = Math.round(new Date().getTime() / 1000);    // get current seconds from epoch because thats what we are comparing with
        if(Math.abs(secondsFromEpoch - timestamp > 60 * 5)){return false;} // make sure request isn't a duplicate
        var computedSig = 'v0=' + crypto.createHmac('sha256', varify.slack_sign_secret).update('v0:' + timestamp + ':' + event.body).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(event.headers['X-Slack-Signature'], 'utf8'), Buffer.from(computedSig ,'utf8'));
    }
};
