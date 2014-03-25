//users route
'use strict';

var User = require('../models/user');
//var request = require('request');


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

exports.failRegister = function(req, res){
  res.render('home/index', {title: 'It\'s A Lake Day', registerFail: true});
};

exports.successRegister = function(req, res){
  var login;
  if(req.session.userId){
    login = true;
  }else{
    login=false;
  }
  res.render('home/index', {title: 'It\'s A Lake Day', registerSuccess: true, login:login});
};

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


exports.failLogin = function(req, res){
  res.render('home/index', {title: 'It\'s A Lake Day', logInFail:true});
};

exports.successLogin = function(req, res){
  var login;
  if(req.session.userId){
    login = true;
  }else{
    login = false;
  }
  res.render('home/index', {title: 'It\'s A Lake Day', logInSuccess:true, login:login});
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};
