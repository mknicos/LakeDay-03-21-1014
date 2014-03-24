/* jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var fs = require('fs');
var exec = require('child_process').exec;

//--global varables--//
var User, Boat, Fleet, user2;

describe('User', function(){


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
      User.findById(id, function(record){
        expect(record.userName).to.equal('Test Person');
        expect(record.email).to.equal('test@nomail.com');
        done();
      });
    });
  });

  describe('.findByLakeDay', function(){
    it('should return all users with a lakeDay value as specified', function(done){
      //Test is run assuming 'Test Person', from before each is already
      //in database and has a lake day value of true
      var userObj = {userName:'Bobby Smith', email:'bobbySmith@nomail.com', password:'abcd', isOnLake:false};
      var u1 = new User(userObj);
      u1.register(function(err){
        User.findByLakeDay(true, function(users){
          expect(users[0].userName).to.equal('Test Person');
          expect(users.length).to.equal(1);
          done();
        });
      });
    });
  });

  describe('.addBoat', function(){
    it('should add a boat to a users boats owned array', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'motor', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      boat2.insert(function(){
        User.addBoat(user2._id.toString(), boat2._id.toString(), function(count){
          User.findById(user2._id.toString(), function(record){
            expect(count).to.equal(1);
            expect(record.boatsOwned.length).to.equal(1);
            expect(record.boatsOwned[0]).to.be.instanceof(Mongo.ObjectID);
            done();
          });
        });
      });
    });
  });
  
  describe('.addPhoto', function(){
    beforeEach(function(done){
      var testdir = __dirname + '/../../app/static/img/users/test*';
      var cmd = 'rm -rf ' + testdir;

      exec(cmd, function(){
        var origfile = __dirname + '/../fixtures/chow.jpg';
        var copyfile = __dirname + '/../fixtures/chow-copy.jpg';
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
        done();
      });
    });

    it('should add a Photo to a user', function(done){
      var userObj = {};
      userObj.userName = 'Matt Knicos';
      userObj.email = 'testmatt@matt.com';
      userObj.password = '1234';
      var u1 = new User(userObj);

      var oldname = __dirname + '/../fixtures/chow-copy.jpg';
      console.log(oldname);
      u1.addPhoto(oldname);
      expect(u1.userPhoto).to.equal('/img/users/testmattmattcom/photo.jpg');
      done();
    });
  });
  
  describe('.findFleets', function(){
    it('should return the fleet objects the user has joined', function(){
      var fleetObj = {fleetName:'superpeople'};
      var f1 = new Fleet(fleetObj);
      var fleetObj2 = {fleetName:'awesome sailors'};
      var f2 = new Fleet(fleetObj2);
      var fleetObj3 = {fleetName:'lets go'};
      var f3 = new Fleet(fleetObj3);
      f1.insert(function(){
        f2.insert(function(){
          f3.insert(function(){
            Fleet.addUser(f1._id.toString(), user2._id.toString(), function(){
              Fleet.addUser(f2._id.toString(), user2._id.toString(), function(){
                User.findFleets(user2._id.toString(), function(records){
                  console.log('fleets array records');
                  console.log(records);
                  expect(records.length).to.equal(2);
                });
              });
            });
          });
        });
      });
    });
  });
});
