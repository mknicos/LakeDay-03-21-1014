//boats route
'use strict';

var User = require('../models/user');
var Boat = require('../models/boat');
//var request = require('request');

exports.create = function(req, res){
  var boat = new Boat(req.body);
  boat.insert(function(records){
    if(records === 'duplicate'){
      console.log('duplate boat name add attempt');
      res.redirect('/boatCreateFail');
    }else{
      boat.addPhoto(req.files.boatPhoto.path, function(count){
        User.addBoat(req.session.userId, boat._id.toString(), function(count){
          res.redirect('users/'+req.session.userId);
        });
      });
    }
  });
};
