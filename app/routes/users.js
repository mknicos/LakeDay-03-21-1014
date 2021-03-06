//users route
'use strict';

var User = require('../models/user');
var Boat = require('../models/boat');
//var request = require('request');

//---------register new user------------//
exports.create = function(req, res){
  var user = new User(req.body);
  user.register(function(){
    if(user._id){
      user.addPhoto(req.files.userPhoto.path, function(count){
        res.redirect('/successRegister');
      });
    }else{
      res.redirect('/failRegister');
    }
  });
};
  
    //if fail//
exports.failRegister = function(req, res){
  res.render('home/index', {login: false, title: 'It\'s A Lake Day', registerFail: true});
};
    //if success//
exports.successRegister = function(req, res){
  var login;
  if(req.session.userId){
    login = true;
  }else{
    login=false;
  }
  res.render('home/index', {title: 'It\'s A Lake Day', registerSuccess: true, login:login});
};


//---------login existing user------------//
exports.authenticate = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.redirect('/successLogin');
        });
      });
    }else{
      req.session.destroy(function(){
        res.redirect('/failLogin');
      });
    }
  });
};

     //if fail login//
exports.failLogin = function(req, res){
  res.render('home/index', {login: false, title: 'It\'s A Lake Day', logInFail:true});
};
    //if success login//
exports.successLogin = function(req, res){
  var login;
  if(req.session.userId){
    login = true;
  }else{
    login = false;
  }
  res.render('home/index', {title: 'It\'s A Lake Day', logInSuccess:true, login:login, userId:req.session.userId});
};


//----------users show page-------------//
//need to be logged in to see//

exports.show = function(req, res){
  console.log(req.session.userId);
  User.findById(req.params.id, function(user){
    console.log(user.userName);
    console.log(user);
    Boat.findByOwnerId(user._id.toString(), function(boats){
      console.log(boats);
      User.findFleets(user._id.toString(), function(fleets){
        var userHomePage;
        if(req.session.userId === req.params.id){
          userHomePage = true;
        }else{
          userHomePage = false;
        }
        res.render('users/show', {userHomePage: userHomePage, user:user, boats:boats, fleets: fleets, login:true, newBoatFail:false});
      });
    });
  });
};

exports.showBoatFail = function(req, res){
  User.findById(req.params.id, function(user){
    Boat.findByOwnerId(req.session.userId, function(boats){
      User.findFleets(req.session.userId, function(fleets){
        res.render('users/show', {user:user, boats:boats, fleets: fleets, login:true, newBoatFail:true});
      });
    });
  });
};



//----------logout---------------------//
exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};





