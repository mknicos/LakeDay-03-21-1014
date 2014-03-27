'use strict';

var Mongo = require('mongodb');
var fleets = global.nss.db.collection('fleets');
var users = global.nss.db.collection('users');
var fs = require('fs');
var path = require('path');
var User = require('./user');

module.exports = Fleet;

function Fleet(fleet){
  this.fleetName = fleet.fleetName;
  this.users = [];
  this.captain = fleet.captain; // userMongoId
  this.captainName = fleet.captainName; //string of users name
  this.description = fleet.description;
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
      console.log('duplicate fleet name attempted to be added');
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
  //THIS adds user to fleets array and fleet to users array
  var uId = Mongo.ObjectID(userId);
  var fId = Mongo.ObjectID(fleetId);

  checkForMember(fId, uId, function(isMember){
    if(isMember){
      console.log('already member');
      return fn('already member');
    }else{
      User.findById(userId.toString(), function(userRecord){
          userRecord.fleets.push(fId);
          users.update({_id:uId}, {$set: {fleets:userRecord.fleets}}, function(err, count){
            Fleet.findById(fleetId.toString(), function(fleetRecord){
              fleetRecord.users.push(uId);
              fleets.update({_id:fId}, {$set: {users:fleetRecord.users}}, function(err, count){
                fn(count);
              });
            });
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

Fleet.prototype.addFlag = function(oldpath, fn){
  var dirname = this.fleetName.replace(/\W/g,'').toLowerCase();
  var abspath = __dirname + '/../static';
  var relpath = '/img/fleets/' + dirname;
  fs.mkdirSync(abspath + relpath);
  var extension = path.extname(oldpath);
  relpath += '/flag' + extension;
  fs.renameSync(oldpath, abspath + relpath);
  this.fleetFlag = relpath;
  fleets.update({_id:this._id}, {$set: {fleetFlag:this.fleetFlag}}, function(err, count){
    fn(count);
  });
};

Fleet.findAll = function(fn){
  fleets.find().toArray(function(err, records){
    fn(records);
  });
};

Fleet.findUsers = function(fleetId, fn){
  //input->fleetId string
  //output->User objects in array
  Fleet.findById(fleetId, function(record){
    users.find({_id: {$in: record.users}}).toArray(function(err, users){
      fn(users);
    });
  });
};
