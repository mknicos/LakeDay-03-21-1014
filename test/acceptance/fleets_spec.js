//fleets acceptance test
'use strict';

process.env.DBNAME = 'item-test';
var app = require('../../app/app');
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
var expect = require('chai').expect;
var User, Boat, Fleet;
var cookie;
var matt;

describe('boats', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Boat = require('../../app/models/boat');
      Fleet = require('../../app/models/fleet');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      var userObj = {userName: 'Matt Knicos', email: 'mknicos@gmail.com', password: '1234'};
      matt = new User(userObj);
      matt.register(function(){
        done();
      });
    });
  });


  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'mknicos@gmail.com')
      .field('password', '1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });

    describe('GET /fleets', function(){
      it('should display the fleets index page', function(done){
        request(app)
          .get('/fleets')
          .set('cookie', cookie)
          .expect(200, done);
      });
    });

    describe('POST /fleets', function(){
      before(function(done){
        var testdir = __dirname + '/../../app/static/img/fleets/test*';
        var cmd = 'rm -rf ' + testdir;

        exec(cmd, function(){
          var origfile = __dirname + '/../fixtures/myFlag.jpg';
          var copyfile = __dirname + '/../fixtures/myFlag-copy.jpg';
          var copyfile2 = __dirname + '/../fixtures/myFlag-copy2.jpg';
          fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
          fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile2));
          global.nss.db.dropDatabase(function(err, result){
            var f1 = new Fleet({fleetName:'cool'});
            f1.insert(function(record){
              done();
            });
          });
        });
      });
      describe('POST /fleets', function(){
        it('should post a new fleet into the db', function(done){
          var oldname = __dirname + '/../fixtures/myFlag-copy.jpg';
          request(app)
          .post('/fleets')
          .field('fleetName', 'MotorBoaters')
          .field('descripction', 'Love to go fast')
          .field('captain', matt._id.toString())
          .attach('fleetFlag', oldname)
          .end(function(err, res){
            expect(res.status).to.equal(302);
            done();
          });
        });

        it('should NOT post a new fleet into the db, duplicate fleet name', function(done){
          var oldname = __dirname + '/../fixtures/myFlag-copy2.jpg';
          request(app)
          .post('/fleets')
          .field('fleetName', 'cool')
          .field('descripction', 'Love to go slow and steady')
          .field('captain', matt._id.toString())
          .attach('fleetFlag', oldname)
          .end(function(err, res){
            expect(res.status).to.equal(302);
            done();
          });
        });
      });
    });
  });
});
