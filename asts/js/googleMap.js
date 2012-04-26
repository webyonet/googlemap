/*
 * googleMap jQuery Plugin v1.0.0.2b
 * Licensed under the MIT license.
 * Copyright 2012 G.Burak Demirezen
 */ 
(function ($) {
    $.fn.googleMap = function (options) {
        var defaults = {
            start: '{"position":[39.920914,32.854119]}',
            finish: '{"position":[41.005280,28.976321]}',
			startImage : 'asts/imgs/start.png',
			finishImage : 'asts/imgs/finish.png',
			directionDrag : false,
			readOnline : false,
			zoom : 6
        },
            settings = $.extend(defaults, options);
			
        var 
		$startPoint = new google.maps.LatLng(39.920914, 32.854119), //ankara
            $mapOptions = {
                zoom: settings.zoom,
                center: $startPoint,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            $mapCanvas = $(this).get(0),
            $map = new google.maps.Map($mapCanvas, $mapOptions),
            $directionsService = new google.maps.DirectionsService(),
            $directionsDisplay = new google.maps.DirectionsRenderer({
                map: $map,
                suppressMarkers: true,// rota ikonları gizlemek
                draggable: settings.directionDrag,// oluşturulan çiginin sürüklenbilirmi olacağı
                preserveViewport: false //harita zoom konumunu korumak
            }),
            $pointArray = new Array(2),
            $bounds = new google.maps.LatLngBounds(),
            $geocoder = new google.maps.Geocoder(),
            $startPozition = {
                lat: null,
                lng: null
            },
            $finisPozition = {
                lat: null,
                lng: null
            },
            $markerStart, $markerStartArray = [],
            $markerFinish, $markerFinishArray = [],
			$markersDrag = settings.readOnline == false ? true : false;

        $.zoomSetting = function () { //map zoom setting
            if (($startPozition.lat != null && $startPozition.lng != null) && ($finisPozition.lat != null && $finisPozition.lng != null)) {
                for (i in $pointArray) {
                    Point = $pointArray[i];
                    $bounds.extend(Point);
                }
                $directionsDisplay.setMap($map);
                if (!$bounds.isEmpty()) $map.fitBounds($bounds);
                // yol haritası çiziliyor.
                var _start = new google.maps.LatLng($startPozition.lat, $startPozition.lng),
                    _end = new google.maps.LatLng($finisPozition.lat, $finisPozition.lng),
                    _request = {
                        origin: _start,
                        destination: _end,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING // WALKING DRIVING yada CYCLING 
                    };
                $directionsService.route(_request, function (response, status) { // tarif için gerekli isteğimiz
                    if (status == google.maps.DirectionsStatus.OK) {
                        $directionsDisplay.setDirections(response);
                    }
                });
            }
        }; //map zoom setting end
		
        $.startPosition = function (coordinate) { // start poszition
            var json = JSON.parse(coordinate);
            $startPozition.lat = json.position[0];
            $startPozition.lng = json.position[1];
            if ($startPozition.lat != null && $startPozition.lng != null) {
                var location = new google.maps.LatLng($startPozition.lat, $startPozition.lng);
                $map.setCenter(location);
                if ($markerStartArray) {
                    for (i in $markerStartArray) {
                        $markerStartArray[i].setMap(null);
                    }
                }
                $directionsDisplay.setMap(null);
                $markerStart = new google.maps.Marker({
                    title: 'Başlangıç Noktası',
                    position: location,
                    map: $map,
                    draggable: $markersDrag,
                    icon: settings.startImage
                });
                //start poszition drag event
                google.maps.event.addListener($markerStart, 'dragend', function () {
                    $directionsDisplay.setMap(null);
                    var lat = $markerStart.getPosition().lat(),
                        lng = $markerStart.getPosition().lng();
                    $startPozition.lat = lat;
                    $startPozition.lng = lng;
                    $.zoomSetting();
                    var dragCoordinate = new google.maps.LatLng($startPozition.lat, $startPozition.lng);
                    $geocoder.geocode({
                        'latLng': dragCoordinate
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var markercnt = results[0].formatted_address;
                                $('#startLocationInfo').text(markercnt);
                            }
                        }
                    });
                });
                $pointArray[0] = location;
                $markerStartArray.push($markerStart);
                $.zoomSetting();
            } else {
                if ($markerStartArray) {
                    for (i in $markerStartArray) {
                        $markerStartArray[i].setMap(null);
                    }
                }
                $directionsDisplay.setMap(null);
            }
        }; // start poszition end
		
        $.finishPosition = function (coordinate) { //finish pozition
            var json = JSON.parse(coordinate)
            $finisPozition.lat = json.position[0];
            $finisPozition.lng = json.position[1];
            if ($finisPozition.lat != null && $finisPozition.lng != null) {
                var location = new google.maps.LatLng($finisPozition.lat, $finisPozition.lng);
                $pointArray[1] = location;
                $map.setCenter(location);

                if ($markerFinishArray) {
                    for (i in $markerFinishArray) {
                        $markerFinishArray[i].setMap(null);
                    }
                }
                $directionsDisplay.setMap(null);
                $markerFinish = new google.maps.Marker({
                    title: 'Varış Noktası',
                    position: location,
                    map: $map,
                    draggable: $markersDrag,
                    icon: settings.finishImage
                });
                //finish pozition drag event
                google.maps.event.addListener($markerFinish, 'dragend', function () {
                    $directionsDisplay.setMap(null);
                    var lat = $markerFinish.getPosition().lat(),
                        lng = $markerFinish.getPosition().lng();
                    $finisPozition.lat = lat;
                    $finisPozition.lng = lng;
                    $.zoomSetting();
                    var dragCoordinate = new google.maps.LatLng($finisPozition.lat, $finisPozition.lng);
                    $geocoder.geocode({
                        'latLng': dragCoordinate
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var markercnt1 = results[0].formatted_address;
                                $('#finishLocationInfo').text(markercnt1);
                            }
                        }
                    });
                });
                $markerFinishArray.push($markerFinish);
                $pointArray[1] = location;
                $.zoomSetting();
            } else {
                if ($markerFinishArray) {
                    for (i in $markerFinishArray) {
                        $markerFinishArray[i].setMap(null);
                    }
                }
                $directionsDisplay.setMap(null);
            }
        }; //finish poszition end
		
		$.defaultMap = function(){
			if(!settings.readOnline){
				$.startPosition(settings.start);
				$.finishPosition(settings.finish);
			}else{
				$.startPosition(settings.start);
			}
		}
		
		/*default pozition trigger*/
		$.defaultMap();
    };
})(jQuery);