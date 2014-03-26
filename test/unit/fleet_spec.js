/*jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var fs = require('fs');
var exec = require('child_process').exec;

//--globalVariables--//
var User, Boat, Fleet; //models
var testUser1, testUser2, testUser3;//test users and boats


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
      var userObj3 = {userName:'Chase', email: 'test3@nomail.com', password:'abcd', lakeDay:false};
      testUser3 = new User(userObj3);
      testUser1.register(function(err){
        testUser2.register(function(err){
          testUser3.register(function(err){
            done();
          });
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
        f1.updateCaptain(testUser2._id.toString(), function(count){
          expect(count).to.equal(1);
          expect(f1.captain).to.be.instanceof(Mongo.ObjectID);
          done();
        });
      });
    });
  });

  describe('#findById', function(){
    it('should find a Fleet by its id', function(done){
      var fleetObj = {fleetName:'Pumpkin Spice'};
      var f1 = new Fleet(fleetObj);
      var fleetObj2 = {fleetName:'Awesome Boats'};
      var f2 = new Fleet(fleetObj2);
      f1.insert(function(){
        f2.insert(function(){
          Fleet.findById(f2._id.toHexString(), function(record){
            expect(record.fleetName).to.equal('Awesome Boats');
            done();
          });
        });
      });
    });
  });

  describe('#findAll', function(){
    it('should find all Fleets', function(done){
      var fleetObj = {fleetName:'Pumpkin Spice'};
      var f1 = new Fleet(fleetObj);
      var fleetObj2 = {fleetName:'Awesome Boats'};
      var f2 = new Fleet(fleetObj2);
      f1.insert(function(){
        f2.insert(function(){
          Fleet.findAll(function(records){
            expect(records.length).to.equal(2);
            done();
          });
        });
      });
    });
  });

  describe('.addUser', function(){
    it('should add a user to the fleets users array, and a fleet to the users array', function(done){
      var fleetObj = {fleetName:'Pumpkin Spice'};
      var f1 = new Fleet(fleetObj);
      f1.insert(function(){
        Fleet.addUser(f1._id.toString(), testUser1._id.toString(), function(count){
          expect(count).to.equal(1);
          Fleet.findById(f1._id.toString(), function(record){
            expect(record.users.length).to.equal(1);
            expect(record.users[0].toString()).to.equal(testUser1._id.toString());
            User.findById(testUser1._id.toString(), function(userRecord){
              expect(userRecord.fleets.length).to.equal(1);
              expect(userRecord.fleets[0].toString()).to.equal(f1._id.toString());
              done();
            });
          });
        });
      });
    });

    it('should not add a user to the fleets users array, already a member', function(done){
      var fleetObj = {fleetName:'Pumpkin Spice'};
      var f1 = new Fleet(fleetObj);
      f1.insert(function(){
        Fleet.addUser(f1._id.toString(), testUser1._id.toString(), function(count1){
          Fleet.addUser(f1._id.toString(), testUser1._id.toString(), function(count2){
            expect(count2).to.equal('already member');
            Fleet.findById(f1._id.toString(), function(record){
              expect(record.users.length).to.equal(1);
              done();
            });
          });
        });
      });
    });
  });

  describe('.findUsers', function(){
    it('should return the user objects that are apart of the fleet', function(done){
      var fleetObj = {fleetName:'superpeople'};
      var f1 = new Fleet(fleetObj);
      f1.insert(function(){
        Fleet.addUser(f1._id.toString(), testUser1._id.toString(), function(){
          Fleet.addUser(f1._id.toString(), testUser3._id.toString(), function(){
            Fleet.findUsers(f1._id.toString(), function(records){
              expect(records.length).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });
  
  describe('.addFlag', function(){
    beforeEach(function(done){
      var testdir = __dirname + '/../../app/static/img/fleets/test*';
      var cmd = 'rm -rf ' + testdir;
      exec(cmd, function(){
        var origfile = __dirname + '/../fixtures/myFlag.jpg';
        var copyfile = __dirname + '/../fixtures/myFlag-copy.jpg';
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
        done();
      });
    });

    it('should add a flag to a fleet', function(done){
      var fleetObj = {};
      fleetObj.fleetName = 'Test Super Sailers';
      var f1 = new Fleet(fleetObj);
      var oldname = __dirname + '/../fixtures/myFlag-copy.jpg';
      f1.insert(function(){
        f1.addFlag(oldname, function(count){
          expect(f1.fleetFlag).to.equal('/img/fleets/testsupersailers/flag.jpg');
          expect(count).to.equal(1);
          done();
        });
      });
    });
  });
});
