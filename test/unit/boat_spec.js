/*jshint expr:true */
'use strict';

process.env.DBNAME = 'mochaTest-lakeDay';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var fs = require('fs');
var exec = require('child_process').exec;

//--global varables--//
var Boat, boat1;

describe('Boat', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Boat = require('../../app/models/boat');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      var boatObj = {boatName:'Pumpkin Spice', make:'Hobie Cat', boatType:'motor', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      boat1 = new Boat(boatObj);
      boat1.insert(function(){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new User Object', function(){
      var boatObj = {boatName:'Mer Mer', make:'Hobie Cat', boatType:'Sailboat', year:'1985', ownerId:'999999999999999999999999', description:'Awesome Boat'};
      var b1 = new Boat(boatObj);
      expect(b1).to.be.instanceof(Boat);
      expect(b1.boatName).to.equal('Mer Mer');
      expect(b1.boatType).to.equal('Sailboat');
      expect(b1.ownerId).to.be.instanceof(Mongo.ObjectID);
    });
  });

  describe('#insert', function(){
    it('should insert a boat into the database', function(done){
      var boatObj = {boatName:'Mer Mer', make:'Hobie Cat', boatType:'Sailboat', year:'1985', description:'Awesome Boat'};
      var b1 = new Boat(boatObj);
      b1.insert(function(boats){
        expect(boats[0].boatName).to.deep.equal('Mer Mer');
        expect(b1).to.be.instanceof(Boat);
        done();
      });
    });

    it('should not insert a boat because boat name already exists', function(done){
      var boatObj = {boatName:'Something', make:'Anything', boatType:'Motor', year:'1900', description:'Not So Awesome Boat'};
      var b1 = new Boat(boatObj);
      var boatObj2 = {boatName:'Pumpkin Spice', make:'Hobie Cat', boatType:'Sail', year:'1990', description:'Awesome Boat'};
      var b2 = new Boat(boatObj2);

      b1.insert(function(){
        b2.insert(function(dup){
          expect(dup).to.equal('duplicate');
          done();
        });
      });
    });
  });

  describe('.findById', function(){
    it('should return a user by thier id', function(done){
      var id = boat1._id.toString();
      Boat.findById(id, function(record){
        expect(record.boatName).to.equal('Pumpkin Spice');
        expect(record.year).to.equal(1978);
        expect(record._id.toString()).to.equal(boat1._id.toString());
        done();
      });
    });
  });

  describe('.findByOwnerId', function(){
    //boat with owner id of 2's is in before each
    //added one more here with owner id of 2's
    //and one without, should return 2 boats
    it('should return boats based on their owner id', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(one){
        boat3.insert(function(two){
          Boat.findByOwnerId('999999999999999999999999', function(boats){
            expect(boats.length).to.equal(2);
            done();
          });
        });
      });
    });
    it('should not return any boats because owner has no boats', function(done){
      Boat.findByOwnerId('333333333333333333333333', function(boats){
        expect(boats.length).to.equal(0);
        done();
      });
    });
  });

  describe('.findAll', function(){
    it('should return all boats in the database', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(){
        boat3.insert(function(){
          Boat.findAll(function(records){
            expect(records.length).to.equal(3);
            done();
          });
        });
      });
    });
  });

  describe('.deleteById', function(){
    it('should delete a boat from the database', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(){
        boat3.insert(function(){
          Boat.deleteById(boat2._id.toString(), function(count){
            Boat.findAll(function(records){
              expect(records.length).to.equal(2);
              expect(count).to.equal(1);
              done();
            });
          });
        });
      });
    });
  });

  describe('.findByBoatType', function(){
    //test is assuming one boat of type 'motor' is inputed in before each
    it('should find all boats of a given type', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'motor', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(){
        boat3.insert(function(){
          Boat.findByBoatType('motor', function(boats){
            expect(boats.length).to.equal(2);
            expect(boats[0].boatType).to.equal('motor');
            done();
          });
        });
      });
    });
  });

  describe('.findByBoatName', function(){
    it('should return all boats with a given name', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'motor', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Hobie Cat', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(){
        boat3.insert(function(){
          Boat.findByBoatName('Bruised Pink', function(record){
            expect(record.boatType).to.equal('motor');
            expect(record.ownerId.toString()).to.equal('111111111111111111111111');
            expect(record.boatName).to.equal('Bruised Pink');
            done();
          });
        });
      });
    });
  });

  describe('.findByBoatMake', function(){
    it('should return all boats with a given make', function(done){
      var boatObj2 = {boatName:'Bruised Pink', make:'Hobie Cat', boatType:'motor', year:'1978', ownerId:'111111111111111111111111', description:'Not So Awesome Boat'};
      var boat2 = new Boat(boatObj2);
      var boatObj3 = {boatName:'Crazy Boat', make:'Olympic', boatType:'Sailboat', year:'1978', ownerId:'999999999999999999999999', description:'Not So Awesome Boat'};
      var boat3 = new Boat(boatObj3);
      boat2.insert(function(){
        boat3.insert(function(){
          Boat.findByBoatMake('Hobie Cat', function(records){
            expect(records.length).to.equal(2);
            expect(records[0].boatName).to.not.equal('Crazy Boat');
            done();
          });
        });
      });
    });
  });
  
  describe('.addPhoto', function(){
    beforeEach(function(done){
      var testdir = __dirname + '/../../app/static/img/boats/test*';
      var cmd = 'rm -rf ' + testdir;

      exec(cmd, function(){
        var origfile = __dirname + '/../fixtures/guitarBoat.jpg';
        var copyfile = __dirname + '/../fixtures/guitarBoat-copy.jpg';
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
        done();
      });
    });

    it('should add a photo to the boat', function(done){
      var boatObj = {};
      boatObj.boatName = 'Test Mer Mer She Wrote';
      boatObj.year = 1995;
      var b1 = new Boat(boatObj);

      var oldname = __dirname + '/../fixtures/guitarBoat-copy.jpg';
      b1.insert(function(){
        b1.addPhoto(oldname, function(count){
          expect(b1.boatPhoto).to.equal('/img/boats/testmermershewrote/photo.jpg');
          expect(count).to.equal(1);
          done();
        });
      });
    });
  });
});
