//boats route
'use strict';

//var User = require('../models/user');
var Boat = require('../models/boat');
//var request = require('request');

exports.create = function(req, res){
  var boat = new Boat(req.body);
  boat.insert(function(records){
    if(records === 'duplicate'){
      res.redirect('/boatCreateFail');
    }else{
      res.redirect('users/show');
    }
  });
};
