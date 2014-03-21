/* jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
//var Mongo = require('mongodb');

//--global varables--//
var User;

describe('User', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      done();
    });
  });

  describe('new', function(){
    it('should create a new User Object', function(){
      var obj = {userName:'Matt Knicos', password:'1234'};
      var u1 = new User(obj);
      expect(u1).to.be.instanceof(User);
      expect(u1.userName).to.equal('Matt Knicos');
      expect(u1.password).to.equal('1234');
    });
  });
});
