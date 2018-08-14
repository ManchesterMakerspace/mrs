// mrs.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

module.exports.remember = function(event, context, callback) {
    console.log(event); // Contains incoming request data (e.g., query params, headers and more)
    var response = {
      statusCode: 200,
      headers: {
        "x-custom-header" : "My Header Value"
      },
      body: JSON.stringify({ "message": "Hello World!" })
    };

    callback(null, response);
};
