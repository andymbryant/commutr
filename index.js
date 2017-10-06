$(function(){
  init();
  initMapAlpha()
})

function startOver() {
  location.reload();
}

//I am now testing at 6:41p.

let homeAddress = [];
let newAddress = [];

function init() {
  $('#address-input').val('');
  $('button').on('click', function(event){
    event.preventDefault();
    let location = $('#address-input').val();
    setNav();
    $('#prompt').addClass('none');
    $('#map').removeClass('none');
    $('#icon').removeClass('none');
    $('#places').removeClass('none');
    $('#select').removeClass('none');
    $('#mySidenav').removeClass('transparent');
    geoCode(location);
    $('#startOver').removeClass('none');
    $('#bottom').removeClass('none');
    $('#startOver').removeClass('none');
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
        initMap(lat, lng, formattedAddress);
    })
    .catch(function(error){
      console.log(error);
    })
  }
}

let map;

function initMapAlpha() {
  let options = {
    zoom:5,
    center: new google.maps.LatLng(39.8097, -98.5556),
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  }
  map = new google.maps.Map(document.getElementById('map'), options);
}

function initMap(x, y, a) {
  map.panTo(new google.maps.LatLng(x, y));
  map.setZoom(14);
  let originString = `<div id="originString">
  <p>Your origin is <strong>${a}.</strong><p>
  <p>Click on the map to find commute times to and from other locations.</p>
  </div>
  `;
   $('#origin').html(`<h3>Your origin is <strong>${a}</strong></h3>`);
   var infowindow = new google.maps.InfoWindow({
     content: originString,
     maxWidth: 300
   });

  let labels = '123456789';
  let labelIndex = 0;
  // let map = new google.maps.Map(document.getElementById('map'), options);r
  let alpha_marker = new google.maps.Marker({
    position: new google.maps.LatLng(x, y),
    map:map,
    icon:'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  });
  infowindow.open(map, alpha_marker);
  setTimeout(function () { infowindow.close(); }, 8000);
  let z = 0;
  let geocoder = new google.maps.Geocoder();
  alpha_marker.addListener('click', function() {
    if (infowindow.getMap() !== null) {
      infowindow.close();
    }
      else if (infowindow.getMap() == null) {
        infowindow.open(map, alpha_marker);
      }
  });
  google.maps.event.addListener(map, 'click', function(event) {
     infowindow.close();
     placeMarker(event.latLng);
     geocoder.geocode({
       'latLng': event.latLng
     }, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
         if (results[0]) {
           let betaAddress = results[0].formatted_address;
           newAddress.push(betaAddress);
           z += 1;
           let type = $('#type').find(":selected").text();
           getDistance(betaAddress, type.toUpperCase(), z);
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
function getDistance(x, y, z) {
  let travelModeVar;
  for (let travelMode in google.maps.DirectionsTravelMode){
    if (travelMode==y) {
      travelModeVar = y;
    }
  }
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin      : homeAddress[0],
    destination : x,
    travelMode  : travelModeVar
  };

  directionsService.route(request, function(response, status) {
    if ( status == google.maps.DirectionsStatus.OK ) {
      let caseY = properCase(y);
      let distance = Math.floor(response.routes[0].legs[0].duration.value/60)
      let distance2 = response.routes[0].legs[0].duration.value%60;
      $('#places ol').append(`<li>${x}<ul class=${z}></ul></li>`);
      $(`.${z}`).append(`<li><strong><span id="${caseY}">${caseY}:</span></strong> <strong>${distance} minutes ${distance2} seconds</strong> from the origin.</li>`);
    }
  else {
    alert("Sorry. There is no route between these points. Please try again.")
    }
  })
};

function setNav() {
    document.getElementById("mySidenav").style.width = "25%";
}

function openNav() {
    document.getElementById("mySidenav").style.left = "0px";
}

function closeNav() {
    document.getElementById("mySidenav").style.left = "-500px";
}

function closeNavIcon() {
    document.getElementById("mySidenav").style.left = "-500px";
}

function openClose(x) {
   if ($('.container').hasClass('change') === true) {
     x.classList.toggle("change");
     closeNav();
   }
    else if ($('.container').hasClass('change') === false) {
      x.classList.toggle("change");
      openNav();
    }
}

function pushAddress(x) {
  originString = $(`Your origin address is ${x}`);
}

function closeInfoWindow() {
  infowindow.close();
}

function properCase(string) {
    return string.replace(/\w\S*/g, function (word) {
        return word.charAt(0) + word.slice(1).toLowerCase();
    });
}
