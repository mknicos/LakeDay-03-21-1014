'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var users = require('../routes/users');

//-----home--------//
  app.get('/', d, home.index);
  app.get('/failLogin', d, users.failLogin);
  app.get('/successLogin', d, users.successLogin);
  app.get('/failRegister', d, users.failRegister);
  app.get('/successRegister', d, users.failRegister);

//-----users------//
  app.post('/register', d, users.create);
  app.post('/login', d, users.authenticate);

//-----boats------//


//-----fleets------//



  console.log('Routes Loaded');
  fn();
}

