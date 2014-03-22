/*jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
var Mongo = require('mongodb');

//--globalVariables--//
var User, Boat, Fleet; //models
var testUser1, testUser2;//test users and boats


describe('Fleet', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Boat = require('../../app/models/boat');
      Fleet = require('../../app/models/fleet');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      var userObj = {userName:'Test Person', email: 'test@nomail.com', password:'1234', lakeDay:true};
      testUser1 = new User(userObj);
      var userObj2 = {userName:'Another Person', email: 'test2@nomail.com', password:'abcd', lakeDay:false};
      testUser2 = new User(userObj2);
      testUser1.register(function(err){
        testUser2.register(function(err){
          done();
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new Fleet', function(done){
      var fleetObj = {fleetName:'Super Sailers'};
      fleetObj.captain = testUser1._id.toString();
      var f1 = new Fleet(fleetObj);
      expect(f1).to.be.instanceof(Fleet);
      expect(f1.fleetName).to.equal('Super Sailers');
      expect(f1.captain).to.be.instanceof(Mongo.ObjectID);
      done();
    });
  });

  describe('#insert', function(){
    it('should insert a fleet into the database', function(done){
      var fleetObj = {fleetName:'Super Sailers'};
      var f1 = new Fleet(fleetObj);
      f1.insert(function(fleets){
        expect(fleets[0].fleetName).to.deep.equal('Super Sailers');
        expect(fleets).to.have.length.of(1);
        done();
      });
    });

    it('should not insert a fleet because that name already exists', function(done){
      var fleetObj = {fleetName:'Super Sailers'};
      var f1 = new Fleet(fleetObj);
      var fleetObj2 = {fleetName:'Super Sailers'};
      var f2 = new Fleet(fleetObj2);
      f1.insert(function(){
        f2.insert(function(dup){
          expect(dup).to.equal('duplicate');
          done();
        });
      });
    });
  });

  describe('#updateCaptain', function(){
    it('should update the fleets captain', function(done){
      var fleetObj = {fleetName:'Awesome Boats'};
      fleetObj.captain = testUser1._id.toString();
      var f1 = new Fleet(fleetObj);
      f1.insert(function(){
        console.log('f1');
        console.log(f1);
        f1.updateCaptain(testUser2._id.toString(), function(count){
          expect(count).to.equal(1);
          console.log('f1');
          console.log(f1);
          expect(f1.captain.toHexString()).to.equal(testUser2._id.toHexString());
          expect(f1.captain).to.beinstanceof(Mongo.ObjectID);
          done();
        });
      });
    });
  });
});
