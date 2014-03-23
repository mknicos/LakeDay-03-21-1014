'use strict';

var Mongo = require('mongodb');
var fleets = global.nss.db.collection('fleets');
//var _ = require('lodash');
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
  //output-> count or 'already member'
  var uId = Mongo.ObjectID(userId);
  var fId = Mongo.ObjectID(fleetId);

  checkForMember(fId, uId, function(isMember){
    if(isMember){
      console.log('already member');
      return fn('already member');
    }else{
      console.log('new member');
      Fleet.findById(fleetId.toString(), function(record){
        record.users.push(uId);
        fleets.update({_id:fId}, {$set: {users:record.users}}, function(err, count){
          fn(count);
        });
      });
    }
  });
};

function checkForMember(fleetId, userId, fn){
  //checks to see if user is already a member of fleet

  fleets.findOne({_id:fleetId, users:userId}, function(err, record){
    fn(record);
  });
}
