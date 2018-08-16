// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

var crypto = require('crypto');                      // verify request from slack is from slack with hmac-256
var querystring = require('querystring');            // Parse urlencoded body

module.exports.remember = function(event, context, callback) {
    var body = querystring.parse(event.body);        // Parse urlencoded body
    var response = {statusCode: 403};                // until request is authentically varified as from slack
    if(varify.request(event)){                       // make sure this request comes from slack
        response = {
            statusCode: 200,
            headers: {
                'Content-type': 'application/json'   // content type for richer responses beyound just text
            },
            body: JSON.stringify({
                'text': 'hello ' + body.user_name + '!',
                // 'attachments': [{ 'text': 'yo' }] // This an example of how attachments are formated
            })
        };
    }
    callback(null, response);
};


var varify = {
    slack_sign_secret: process.env.SLACK_SIGNING_SECRET,
    request: function(event){
        var timestamp = event.headers['X-Slack-Request_Timestamp'];            // nonce from slack to have an idea
        if(Math.abs(new Date().getTime() - timestamp > 60 * 5)){return false;} // make sure request isn't a duplicate
        var computedSig = crypto.createHmac('sha256', verify.slack_sign_secret).update('v0:' + timestamp + ':' + event.body).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(event.headers['X-Slack-Signature'], 'utf8'), Buffer.from(computedSig ,'utf8'));
    }
};
