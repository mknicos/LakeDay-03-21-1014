'use strict';

var Mongo = require('mongodb');
var fleets = global.nss.db.collection('fleets');
var _ = require('lodash');
module.exports = Fleet;

function Fleet(fleet){
  this.fleetName = fleet.fleetName;
  this.users = [];
  this.captain = new Mongo.ObjectID(fleet._id);
}


Fleet.prototype.insert = function(fn){
  //input->Boat Instance
  //returns->fleets array of inserted fleets if success,
  // 'duplicate' string if boat name already exists

  var self = this;
  fleets.findOne({fleetName:this.fleetName}, function(err, fleet){
    if(!fleet){ //if no boat with that name is in db
      fleets.insert(self, function(err, record){
        fn(record);
      });
    }else{ //if boat name already exists
      fn('duplicate');
    }
  });
};

Fleet.prototype.updateCaptain = function(userId, fn){
  //this method is call on a Fleet Object
  //input-> userId is the userId of the user you want to
  //be the new captain
  var fleetId = this._id;
  var uId = Mongo.ObjectID(userId);
  fleets.update({_id:fleetId}, {$set: {captain:uId}}, function(err, count){
    fn(count);
  });
};

Fleet.findById = function(fleetId, fn){
  var _id = Mongo.ObjectID(fleetId);
  fleets.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};


Fleet.addUser = function(fleetId, userId, fn){
  //input-> userId string, fleetId string
  //output-> count
  var uId = Mongo.ObjectID(userId);
  var fId = Mongo.ObjectID(fleetId);
  Fleet.findById(fleetId.toString(), function(record){
    console.log('record.users');
    console.log(record.users);
    for(var i = 0; i < record.users.length; i++){
     //need to print out the string versions of all user object Ids in fleet.users array 
    }
    var isMember = _.contains(record.users, uId);
    console.log('isMember');
    console.log(isMember);
    if(!isMember){
      console.log('not a member yet');
      record.users.push(uId);
      console.log(record.users);
      fleets.update({_id:fId}, {$set: {users:record.users}}, function(err, count){
        fn(count);
      });
    }else{
      console.log('already member');
      fn('already member');
    }
  });
};
