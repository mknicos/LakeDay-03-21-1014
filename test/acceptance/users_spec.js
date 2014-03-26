//users acceptance test

'use strict';

process.env.DBNAME = 'users-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var fs = require('fs');
var exec = require('child_process').exec;
var User, matt;
var cookie;

describe('users', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      matt = new User({userName: 'Matt Knicos', email:'testmatt@aol.com', password:'1234'});
      matt.register(function(err){
        done();
      });
    });
  });

  describe('GET /', function(){
    it('should display the home page', function(done){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });

  describe('POST /register', function(){
    before(function(done){
      var testdir = __dirname + '/../../app/static/img/users/test*';
      var cmd = 'rm -rf ' + testdir;

      exec(cmd, function(){
        var origfile = __dirname + '/../fixtures/chow.jpg';
        var copyfile = __dirname + '/../fixtures/chow-copy.jpg';
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
        global.nss.db.dropDatabase(function(err, result){
          done();
        });
      });
    });

    it('should register a user', function(done){
      var oldname = __dirname + '/../fixtures/chow-copy.jpg';
      request(app)
      .post('/register')
      .field('email', 'testsue@aol.com')
      .field('userName', 'Sue Susan')
      .field('password', '1234')
      .attach('userPhoto', oldname)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.text).to.not.include('OOPS');
        done();
      });
    });

    it('should not register a user due to duplicate', function(done){
      var oldname = __dirname + '/../fixtures/chow-copy.jpg';
      request(app)
      .post('/register')
      .field('email', 'testmatt@aol.com')
      .field('userName', 'Sam Smith')
      .field('password', 'abcd')
      .attach('userPhoto', oldname)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('POST /login', function(){
    it('should login a user', function(done){
      request(app)
      .post('/login')
      .field('email', 'testmatt@aol.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers['set-cookie']).to.have.length(1);
        expect(res.text).to.not.include('not match');
        done();
      });
    });

    it('should not login a user due to bad login', function(done){
      request(app)
      .post('/login')
      .field('email', 'testmatt@aol.com')
      .field('password', 'wrong')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('GET /logout', function(){
    it('should log a user out successfully', function(done){
      request(app)
      .get('/logout')
        .expect(302, done);
    });
  });

  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'testmatt@aol.com')
      .field('password', '1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });

    describe('GET /users/show', function(){
      it('should show users show page', function(done){
        request(app)
        .get('/users/show')
        .set('cookie', cookie)
        .end(function(err, res){
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});

