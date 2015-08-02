var express = require('express');
var app = express();

// Arg 0 will be node, arg 1 will be the name of this file, arg 2 will be the directory to serve
var clientDirectory = process.argv[2] || '/';

app.use(express.static(clientDirectory));

var port = process.env.PORT || 3000;

app.listen(port);
console.log('Serving directory ' + clientDirectory + ' on port ' + port);