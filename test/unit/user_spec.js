/* jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
var Mongo = require('mongodb');

//--global varables--//
var User, user2;

describe('User', function(){


  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      done();
    });
  });
  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      var userObj = {userName:'Test Person', email: 'test@nomail.com', password:'1234'};
      user2 = new User(userObj);
      user2.register(function(err){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new User Object', function(){
      var userObj = {userName:'Matt Knicos', email: 'mknicos@gmail.com', password:'1234'};
      var u1 = new User(userObj);
      expect(u1).to.be.instanceof(User);
      expect(u1.userName).to.equal('Matt Knicos');
      expect(u1.email).to.equal('mknicos@gmail.com');
      expect(u1.password).to.equal('1234');
    });
  });

  describe('#register', function(){
    it('should register a new user and insert in database', function(done){
      var userObj = {userName:'Matt Knicos', email: 'mknicos@gmail.com', password:'1234'};
      var u1 = new User(userObj);
      u1.register(function(err){
        expect(u1.err).to.be.not.ok;
        expect(u1.password).to.have.length(60);
        expect(u1._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
    it('should not register the user because of duplicate email', function(done){
      var userObj = {userName:'Matt Knicos', email: 'mknicos@gmail.com', password:'1234'};
      var u1 = new User(userObj);
      var userObj2 = {userName:'Bob Smith', email: 'mknicos@gmail.com', password:'abcd'};
      var u2 = new User(userObj2);
      u1.register(function(err){
        u2.register(function(err){
          expect(u2.err).to.be.err;
          done();
        });
      });
    });
  });

  describe('.findByEmailAndPassword', function(){
    it('should find user by email and password', function(done){
      User.findByEmailAndPassword('test@nomail.com', '1234', function(user){
        expect(user.email).to.equal('test@nomail.com');
        done();
      });
    });
    it('should not find user - bad email', function(done){
      User.findByEmailAndPassword('sam@aol.com', '1234', function(user){
        expect(user).to.be.null;
        done();
      });
    });
    it('should not find user - bad password', function(done){
      User.findByEmailAndPassword('mknicos@gmail.com', '1234', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should return a user by thier id', function(done){
      var id = user2._id.toString();
      console.log('id>>>>>>>>>>');
      console.log(id);
      User.findById(id, function(record){
        console.log('record>>>>>>>>');
        console.log(record);
        expect(record.userName).to.equal('Test Person');
        expect(record.email).to.equal('test@nomail.com');
        done();
      });
    });
  });

});