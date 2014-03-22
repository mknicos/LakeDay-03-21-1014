'use strict';

var Mongo = require('mongodb');
var boats = global.nss.db.collection('boats');

module.exports = Boat;

function Boat(boat){
  this.boatName = boat.boatName; //string
  this.year = parseInt(boat.year); //integer
  this.boatType = boat.boatType; //string
  this.owner = Mongo.ObjectID(boat.owner); //MongoId of user
  this.description = boat.description; //string
}

Boat.prototype.insert = function(fn){
  //input->Boat Instance
  //returns->nothing if success, 'duplicate' string if boat name already exists

  var self = this;
  boats.findOne({boatName:this.boatName}, function(err, boat){
    if(!boat){ //if no boat with that name is in db
      boats.insert(self, function(err, record){
        fn(record);
      });
    }else{ //if boat name already exists
      fn('duplicate');
    }
  });
};

Boat.findById = function(id, fn){
  //input-> User Id String
  //returns-> One complete Boat Object

  var _id = Mongo.ObjectID(id);
  boats.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};
