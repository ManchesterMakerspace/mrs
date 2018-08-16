// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

var crypto = require('crypto');        // verify request from slack is from slack with hmac-256
var fs = require('fs');                // i dunno, I like files, and chickens
// var bParser = require('body-parser');  // read incoming request bodies AKA &+% diliminated weirdness in api request, maybe this is just for middleware?

module.exports.remember = function(event, context, callback) {
    var response = {
      statusCode: 200,
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
            'text': 'hello world',
            'attachments': [{ 'text': event.body }]
      })
    };
     callback(null, response);
};

/*
var varify = {
    slack_sign_secret: process.env.SLACK_SIGNING_SECRET,
    request: function(expectedBody){

    }
};
*/
