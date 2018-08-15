// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

module.exports.remember = function(event, context, callback) {
    var response = {
      statusCode: 200,
      headers: {
        "x-custom-header" : "My Header Value"
      },
      body: event.body.text
    };

    callback(null, response);
};
