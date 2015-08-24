$(document).ready(function (){
    ymaps.ready(init);
    var myMap;
    var placemarks = [];
    var placemarkId = 1;
    var distances = [];

    function init(){
        myMap = new ymaps.Map("map-container", {
            center: [37.6, 55.7],
            zoom: 9,
            controls: ["zoomControl", "trafficControl","typeSelector"]
        });

        myMap.events.add("click", function(e) {
            addMarker(e.get("coords"));
        });

        var myButton = new ymaps.control.Button("Очистить");
        myButton.events.add("press", function(e) {
            myMap.geoObjects.removeAll();
            placemarkId = 1;
            changeRoutes();
        });

        myMap.controls.add(myButton, {
            float: "none",
            position: {
                top: 10,
                left: 10
            },
            selectOnClick: false
        });

    };



    function addMarker(location) {    
        var geoPlacemark = new ymaps.Placemark(
            location,
            {iconContent: placemarkId},
            {draggable: true}
        );
        
        myMap.geoObjects.add(geoPlacemark);
        geoPlacemark.events.add("drag", function(e){
            changeRoutes();
        });

        geoPlacemark.events.add("contextmenu", function(e) {
            myMap.geoObjects.remove(geoPlacemark);
            changeRoutes();
        });
        
        var tagN = prompt("Введите номер метки", placemarkId);
        if( tagN != null) {
            geoPlacemark.properties.set("iconContent", tagN);

            placemarks.push( {id:tagN, placemark:geoPlacemark});
            changeRoutes();
            placemarkId +=1;
        }
    };

    function changeRoutes() {
        var text = "";
        var pointsCount = 0;
        myMap.geoObjects.each(function (item) {
            if(item.geometry && item.geometry.getType() == "Point") {
                text += "точка: " + item.properties.get("iconContent");
                text += " корды: ";
                text += "yandexnavi://build_route_on_map?lat_to=";
                text += item.geometry.getCoordinates()[1].toFixed(5);
                text += "&lon_to=";
                text += item.geometry.getCoordinates()[0].toFixed(5);
                text += "\n";
                pointsCount+=1;
            }
        });

        document.getElementById("routes-links").rows = pointsCount;
        $('#routes-links').val( text );

        //computeBestRoute();
    };

/*
    function computeBestRoute() {
        distances = [];
        var pointsCount = placemarks.length;

        var distancesCount = pointsCount * pointsCount;

        for(var i=0; i < pointsCount; i++) {
            distances[i]=[]
            for(var j=0; j < pointsCount; j++) {
                (function(i,j) {
                    ymaps.route(
                        [placemarks[i].placemark.geometry.getCoordinates(),
                        placemarks[j].placemark.geometry.getCoordinates()]).then(
                            function (route) {
                                distances[i][j] = route.getTime();
                                distancesCount-=1;
                                if(distancesCount==0 ){
                                    getWay();
                                }
                            },
                            function (error) {
                               alert('Нет пути =(');
                            }
                        );
                })(i,j);
            };         
        }
    };

    function permutator(inputArr) {
        var results = [];

        function permute(arr, memo) {
            var cur, memo = memo || [];

            for (var i = 0; i < arr.length; i++) {
              cur = arr.splice(i, 1);
              if (arr.length === 0) {
                results.push(memo.concat(cur));
              }
              permute(arr.slice(), memo.concat(cur));
              arr.splice(i, 0, cur[0]);
            }

            return results;
        }

        return permute(inputArr);
    }

    function getTime(permutation) {
        var time = 0;
        var pointsCount = placemarks.length;
        for(var i = 0; i < pointsCount - 1;i++) {
            time+=distances[permutation[i]][permutation[i+1]];
        }
        return time;
    }
    function getWay() {
        var pointsCount = placemarks.length;
        var inputArr =[];
        for(var i=0;i<pointsCount;i++) {
            inputArr.push(i);
        }

        var permutations = permutator(inputArr);

        var bestId = 0;
        var bestTime = getTime(permutations[0]);

        for( var i = 1; i < permutations.length; i++) {
            var currentTime = getTime(permutations[i]);

            if( currentTime < bestTime) {
                bestTime = currentTime;
                bestId = i;
            }
        }
        console.log(permutations[bestId]);

    };
*/

    $('#sumbit-point').click(function(){
        var myGeocoder = ymaps.geocode($('#point-description').val());
        myGeocoder.then(
            function (res) {
                if(res.geoObjects.getLength()==0) {
                    alert("Такая точка не найдена");
                } else {
                    var pointCoordinates = res.geoObjects.get(0).geometry.getCoordinates();
                    addMarker(pointCoordinates);
                    myMap.setCenter(pointCoordinates);
                }
            }
        );
    });
})