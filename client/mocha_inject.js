global.expect = require('expect.js');
global._ = require('underscore');
global.Rx = require('rx');
// jquery, jquery-ui and bootstrap seems fine, now d3 seem to be off
// or maybe it is the CSS which is not included, cause I get a lot of 'element not visible' errors.
global.$ = global.jQuery =  require('jquery');
require('jquery-ui/dist/jquery-ui');
require('bootstrap');

global.d3  = require('d3');