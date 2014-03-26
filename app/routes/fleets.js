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

    console.log('req.session.userId');
    console.log(req.session.userId);
    console.log('records');
    console.log(records);
    res.render('fleets/index', {fleets:records, login:login, userId:req.session.userId});
  });
};

exports.create = function(req, res){
  var captainId = new Mongo.ObjectID(req.body.captain);
  req.body.captain = captainId;
  var fleet = new Fleet(req.body);
  console.log('req.body');
  console.log(req.body);
  fleet.insert(function(record){
    if(record !== 'duplicate'){
      fleet.addFlag(req.files.fleetFlag.path, function(count){
        res.redirect('/users/'+req.session.userId);
      });
    }else{
      res.redirect('/users/'+req.session.userId);
    }
  });
};
