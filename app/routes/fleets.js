//fleets route

'use strict';

var Fleet = require('../models/fleet');
var Mongo = require('mongodb');

exports.index = function(req, res){
  Fleet.findAll(function(records){

    var login;
    if(req.session.userId){
      login = true;
    }else{
      login=false;
    }
    res.render('fleets/index', {fleets:records, login:login, userId:req.session.userId});
  });
};

exports.create = function(req, res){
  var captainId = new Mongo.ObjectID(req.body.captain);
  req.body.captain = captainId;
  var fleet = new Fleet(req.body);
  fleet.addFlag(req.files.path);
  fleet.insert(function(record){
    res.redirect('/users/'+req.session.userId);
  });
};
