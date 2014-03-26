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
  var boats = require('../routes/boats');
  var fleets = require('../routes/fleets');

//-----home--------//
  app.get('/', d, home.index);
  app.get('/successLogin', d, users.successLogin);
  app.get('/failLogin', d, users.failLogin);
  app.get('/successRegister', d, users.successRegister);
  app.get('/failRegister', d, users.failRegister);

//-----users------//
  app.get('/logout', d, users.logout);
  app.get('/users/:id', d, users.show);
  app.get('/boatCreateFail', d, users.showBoatFail);
  app.post('/register', d, users.create);
  app.post('/login', d, users.authenticate);

//-----boats------//
  app.post('/boats', d, boats.create);


//-----fleets------//
  app.get('/fleets', d, fleets.index);
  app.post('/fleets', d, fleets.create);
  app.get('/fleets/join/:fleetId', d, fleets.addUserToFleet);



  console.log('Routes Loaded');
  fn();
}

