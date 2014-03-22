'use strict';
var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');

module.exports = User;

function User(user){
  this.userName = user.userName;
  this.password = user.password;
  this.email = user.email;
  this.lakeDay = user.lakeDay || false;
  this.boatsOwned = [];
}


User.prototype.register = function(fn){
  var self = this;
  hashPassword(self.password, function(hashedPwd){
    self.password = hashedPwd;
    insert(self, function(err){
      if(self._id){
        fn(err);
      }else{
        fn();
      }
    });
  });
};

function hashPassword(password, fn){
  bcrypt.hash(password, 8, function(err, hash){
    fn(hash);
  });
}

function insert(user, fn){
  users.findOne({email: user.email}, function(err, record){
    if(!record){
      users.insert(user, function(err, record){
        fn(err);
      });
    }else{
      fn();
    }
  });
}

User.findByEmailAndPassword = function(email, password, fn){

  //checks to authenticate user for login
  //input->email, and password
  //returns whole user object if a match

  users.findOne({email:email}, function(err, record){
    if(!record){
      fn(null);
    }else{
      bcrypt.compare(password, record.password, function(err, res){
        if(res){
          fn(record);
        }else{
          fn(null);
        }
      });
    }
  });
};

User.findById = function(id, fn){
  //input-> User Id String
  //returns-> One complete User Object
  var _id = Mongo.ObjectID(id);
  users.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

User.findByLakeDay = function(bool, fn){
  //input->Boolean
  //Returns->Array of user objects
  users.find({lakeDay:bool}).toArray(function(err, records){
    fn(records);
  });
};

User.addBoat = function(userId, boatId, fn){
  //input-> userId String, boatId String
  //output-> count, 1 if success

  var bId = Mongo.ObjectID(boatId);
  User.findById(userId.toString(), function(record){
    console.log('recordInFindBy');
    console.log(record);
    record.boatsOwned.push(bId);
    console.log(record);
    var id = Mongo.ObjectID(record._id.toString());
    users.update({_id:id}, {$set: {boatsOwned:record.boatsOwned}}, function(err, count){
      fn(count);
    });
  });
};
