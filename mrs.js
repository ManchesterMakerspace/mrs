// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

var crypto = require('crypto');                      // verify request from slack is from slack with hmac-256
var querystring = require('querystring');            // Parse urlencoded body

module.exports.remember = function(event, context, callback) {
    var body = querystring.parse(event.body);        // Parse urlencoded body
    var response = {statusCode: 403};                // until request is authentically varified as from slack
    if(varify.request(event)){                       // make sure this request comes from slack
        mongo.storeData(body, function whenStored(error, data){
            response = {
                statusCode: 200,
                headers: {'Content-type': 'application/json'},   // content type for richer responses beyound just text
            };
            if(error){
                response.body = JSON.stringify({'text' : error.name + ': ' + error.code});
            } else {
                response.body = JSON.stringify({'text' : body.user_name + ' just recorded a note- ' + body.text});
            }
            callback(null, response);
        });
    }
};

var mongo = {
    ObjectID: require('mongodb').ObjectID,
    client: require('mongodb').MongoClient,
    connectAndDo: function(connected, failed){         // url to db and what well call this db in case we want multiple
        mongo.client.connect(process.env.MONGO_URI, { useNewUrlParser: true }, function onConnect(error, client){
            if(error)      {failed(error);}     // what to do when your reason for existence is a lie
            else if(client){connected(client);} // passes client connection object so databasy things can happen
        });
    },
    storeData: function(body, onStore){
        console.log('store data called');
        mongo.connectAndDo(function onConnect(client){ // if there is an error skip right to onStore function to hand error and respond
            var textArray = body.text.split(':');      // split arguments with colons
            var member = 'not sure';
            var note = body.text;     // default to full text given no split
            if(textArray.length > 1){ // given we got two arguments split them into member and note fields
                member = textArray[0];
                note = textArray[1];
            }
            client.db('makerspace_testing').collection('notes').insertOne({
                _id: new mongo.ObjectID(),
                timestamp: new Date().getTime(),
                nodeTakerId: body.user_id,
                noteTaker: body.user_name,
                forMember: member,
                note: note,
                channel: body.channel_name,
                channelId: body.channel_id
            }, function whenDone(error, data){
                onStore(error, data);
                client.close();
            });
        }, onStore); // in fail to connect case pass onStore function to handle error
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
