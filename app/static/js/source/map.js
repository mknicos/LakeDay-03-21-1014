/* global Gauge: false */

(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    getUserLocation();
    $('#stopWatch').click(stopWatchingLoc);
    $('#updateSpeed').click(speedGauge);
    $('#changeToMPH').click(clickChangeToMPH);
    $('#changeToKnots').click(clickChangeToKnots);
    $('#changeToKPH').click(clickChangeToKPH);
  }

  var watchID;
  var currentSpeed = 0;
  var maxSpeed = 0;
  var convertUnit = 2.23694; //convert unit is used to change meters per sec to MPH


  function getUserLocation(){
    var geoOptions = {enableHighAccuracy: true, maximumAge: 1000, timeout: 60000};
    watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);
    console.log(watchID);
    console.log('watchID');
  }

  function geoSuccess(location){
    console.log(location.coords.latitude, location.coords.longitude);
    console.log('location.coords.speed');
    console.log(location.coords.speed);
    if(location.coords.speed){
      currentSpeed = location.coords.speed;
      speedGauge();
      $('#speedInteger').text(currentSpeed * convertUnit);
      if(currentSpeed > maxSpeed){
        maxSpeed = currentSpeed;
        $('#maxSpeed').text(maxSpeed * convertUnit);
      }
    }else{
      $('#speedInteger').text(0);
      currentSpeed = 1;
      speedGauge();
    }
  }

  function geoError(){
    alert('fail');
  }

  function stopWatchingLoc(){
    alert('your location has been stopped');
  }


  // ---------------SPEEDOMETER ------------//

  function speedGauge(){
    var opts = {
      lines: 10, // The number of lines to draw
      angle: 0.0, // The length of each line
      lineWidth: 0.44, // The line thickness
      pointer: {
        length: 0.9, // The radius of the inner circle
        strokeWidth: 0.035, // The rotation offset
        color: '#DF691A' // Fill color
      },
      limitMax: 'true',   // If true, the pointer will not go past the end of the gauge
      colorStart: '#5CB85C',   // Colors
      colorStop: '#5bc0de',    // just experiment with them
      strokeColor: '#E0E0E0',   // to see which ones work best for you
      generateGradient: true
    };
    var target = document.getElementById('speedGauge'); // your canvas element
    var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = 20; // set max gauge value
    gauge.animationSpeed = 1; // set animation speed (32 is default value)
    console.log('currentSpeed in gauge');
    console.log(currentSpeed);
    gauge.set(currentSpeed); // set actual value
  }

  //----------------UNIT CONVERTERS --------------------//

  function clickChangeToMPH(){
    convertUnit = 2.23694;
    $('#changeToKnots').removeClass('activeMeas');
    $('#changeToKPH').removeClass('activeMeas');
    $('#changeToMPH').addClass('activeMeas');
    $('#maxSpeed').text(maxSpeed * convertUnit);
    $('#speedInteger').text(currentSpeed * convertUnit);
  }

  function clickChangeToKnots(){
    convertUnit = 1.94384;
    $('#changeToMPH').removeClass('activeMeas');
    $('#changeToKPH').removeClass('activeMeas');
    $('#changeToKnots').addClass('activeMeas');
    $('#maxSpeed').text(maxSpeed * convertUnit);
    $('#speedInteger').text(currentSpeed * convertUnit);
  }

  function clickChangeToKPH(){
    convertUnit = 3.6;
    $('#changeToMPH').removeClass('activeMeas');
    $('#changeToKnots').removeClass('activeMeas');
    $('#changeToKPH').addClass('activeMeas');
    $('#maxSpeed').text(maxSpeed * convertUnit);
    $('#speedInteger').text(currentSpeed * convertUnit);
  }

})();

