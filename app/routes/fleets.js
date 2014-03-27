//fleets route

'use strict';

var Fleet = require('../models/fleet');
var Mongo = require('mongodb');
var users = global.nss.db.collection('users');

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
  users.findOne({_id:captainId}, function(err, user){
    req.body.captain = captainId;
    req.body.captainName = user.userName;
    var fleet = new Fleet(req.body);
    fleet.insert(function(record){
      if(record !== 'duplicate'){
        fleet.addFlag(req.files.fleetFlag.path, function(count){
          res.redirect('/users/'+req.session.userId);
        });
      }else{
        res.redirect('/users/'+req.session.userId);
      }
    });
  });
};

exports.addUserToFleet = function(req, res){
  //result is 1 if added, and 'already member' if already member
  Fleet.addUser(req.params.fleetId, req.session.userId, function(result){
    res.redirect('/users/'+req.session.userId);
  });
};

exports.show = function(req, res){
  Fleet.findById(req.params.fleetId, function(fleet){
    Fleet.findUsers(req.params.fleetId, function(users){
      var boatCount = 0;
      for(var i = 0; i < users.length; i++){
        boatCount += users[i].boatsOwned.length;
      }
      res.render('fleets/show', {boatCount: boatCount, fleet:fleet, users:users, login:true, userId:req.session.userId});
    });
  });
};
