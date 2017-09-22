$(function(){
  init();
})

function startOver() {
  location.reload();
}

let homeAddress = [];
let newAddress = [];

function init() {
  $('#address-input').val('');
  $('button').on('click', function(event){
    event.preventDefault();
    let location = $('#address-input').val();
    $('#prompt').addClass('none');
    $('#map').removeClass('none');
    geoCode(location);
    $('#origin').html(`
      <h4>Your home address is <strong>${location}</strong></h4>
      <p class="inline"><em>Click on the map to find the distance to other locations or </em></p><button class="inline" id="over">start over</button>
      `);
    $('#over').on('click', function(){
      startOver();
    })
  })
  function geoCode(address) {
    let location = address
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location,
        key: 'AIzaSyCZI_FNTwVdkIH94_q1OdbChfEriD_44XI'
      }
    })
    .then(function(response){
        let formattedAddress = response.data.results[0].formatted_address;
        //var addressComponents = response.data.results[0].address_components;
        let lat = response.data.results[0].geometry.location.lat;
        let lng = response.data.results[0].geometry.location.lng;
        homeAddress.push(formattedAddress);
        initMap(lat, lng);
    })
    .catch(function(error){
      console.log(error);
    })
  }
}

function initMap(x, y) {
  let options = {
    zoom:13,
    //center: {lat: x, lng: y}
    center: new google.maps.LatLng(x, y)
  }
  let labels = '123456789';
  let labelIndex = 0;
  let map = new google.maps.Map(document.getElementById('map'), options);
  let alpha_marker = new google.maps.Marker({
    position: new google.maps.LatLng(x, y),
    map:map,
    icon:'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  });


  let z = 0;
  let geocoder = new google.maps.Geocoder();
  google.maps.event.addListener(map, 'click', function(event) {
     placeMarker(event.latLng);
     geocoder.geocode({
       'latLng': event.latLng
     }, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
         if (results[0]) {
           let betaAddress = results[0].formatted_address;
           newAddress.push(betaAddress);
           z += 1;
           getDistanceDriving(betaAddress, z);
           getDistanceTransit(betaAddress, z);
           getDistanceCycling(betaAddress, z);
           getDistanceWalking(betaAddress, z);
         }
       }
     })
   })
  function placeMarker(location) {
      var marker = new google.maps.Marker({
          position: location,
          label: labels[labelIndex++ % labels.length],
          map: map
      });
  }
}
function getDistanceDriving(x, z) {
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin      : homeAddress[0],
    destination : x,
    travelMode  : google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if ( status == google.maps.DirectionsStatus.OK ) {
      //console.log(response.routes[0].legs[0].distance.value); // the distance in metres
      let distance = Math.floor(response.routes[0].legs[0].duration.value/60)
      let distance2 = response.routes[0].legs[0].duration.value%60;
      $('#places ol').append(`<li>${x}<ul class=${z}></ul></li>`);
      $(`.${z}`).append(`<li><strong>Driving:</strong> ${distance} minutes ${distance2} seconds</li>`);
    }
  else {
    alert("Sorry. There is no route between these points. Please try again.")
    }
  })
};

function getDistanceTransit(x, z) {
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin      : homeAddress[0],
    destination : x,
    travelMode  : google.maps.DirectionsTravelMode.TRANSIT
  };
  directionsService.route(request, function(response, status) {
    if ( status == google.maps.DirectionsStatus.OK ) {
      //console.log(response.routes[0].legs[0].distance.value); // the distance in metres
      let distance = Math.floor(response.routes[0].legs[0].duration.value/60)
      let distance2 = response.routes[0].legs[0].duration.value%60;
      $(`.${z}`).append(`<li><strong>Transit:</strong> ${distance} minutes ${distance2} seconds</li>`);
    }
  else {
    alert("Sorry. There is no route between these points. Please try again.")
    }
  })
};

function getDistanceCycling(x, z) {
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin      : homeAddress[0],
    destination : x,
    travelMode  : google.maps.DirectionsTravelMode.BICYCLING
  };
  directionsService.route(request, function(response, status) {
    if ( status == google.maps.DirectionsStatus.OK ) {
      //console.log(response.routes[0].legs[0].distance.value); // the distance in metres
      let distance = Math.floor(response.routes[0].legs[0].duration.value/60)
      let distance2 = response.routes[0].legs[0].duration.value%60;
      $(`.${z}`).append(`<li><strong>Bicyling:</strong> ${distance} minutes ${distance2} seconds</li>`);
    }
  else {
    alert("Sorry. There is no route between these points. Please try again.")
    }
  })
};

function getDistanceWalking(x, z) {
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin      : homeAddress[0],
    destination : x,
    travelMode  : google.maps.DirectionsTravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
    if ( status == google.maps.DirectionsStatus.OK ) {
      //console.log(response.routes[0].legs[0].distance.value); // the distance in metres
      let distance = Math.floor(response.routes[0].legs[0].duration.value/60)
      let distance2 = response.routes[0].legs[0].duration.value%60;
      $(`.${z}`).append(`<li><strong>Walking:</strong> ${distance} minutes ${distance2} seconds</li>`);
    }
  else {
    alert("Sorry. There is no route between these points. Please try again.")
    }
  })
};
