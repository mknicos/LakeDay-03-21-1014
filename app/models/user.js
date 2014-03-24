'use strict';
var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var fs = require('fs');
var path = require('path');

module.exports = User;

function User(user){
  this.userName = user.userName;
  this.password = user.password;
  this.email = user.email;
  this.lakeDay = user.lakeDay || false;
  this.boatsOwned = [];
  this.userPhoto = user.userPhoto;
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

User.prototype.addPhoto = function(oldpath){
  var dirname = this.email.replace(/\W/g,'').toLowerCase();
  console.log('dirname');
  console.log(dirname);
  var abspath = __dirname + '/../static';
  var relpath = '/img/users/' + dirname;
  debugger;
  fs.mkdirSync(abspath + relpath);
  var extension = path.extname(oldpath);
  relpath += '/photo' + extension;
  debugger;
  fs.renameSync(oldpath, abspath + relpath);

  this.userPhoto = relpath;
};

User.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  users.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

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
    record.boatsOwned.push(bId);
    var id = Mongo.ObjectID(record._id.toString());
    users.update({_id:id}, {$set: {boatsOwned:record.boatsOwned}}, function(err, count){
      fn(count);
    });
  });
};

