$(document).ready(function (){
    ymaps.ready(init);
    var myMap;
    var placemarkId = 1;
    var distances = [];
    var myRoute;

    function init(){
        myMap = new ymaps.Map("map-container", {
            center: [55.7, 37.6],
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

       // var myButton2 = new ymaps.control.Button("Картинку");
       // myButton2.events.add("press", function(e) {
       //     mapToImage();
       // });

        var myButton3 = new ymaps.control.Button("Маршрут");
        myButton3.events.add("press", function(e) {
            getBestRoute();
        });

        myMap.controls.add(myButton, {
            float: "none",
            position: {
                top: 10,
                left: 10
            },
            selectOnClick: false
        });

     /*   myMap.controls.add(myButton2, {
            float: "none",
            position: {
                top: 40,
                left: 10
            },
            selectOnClick: false
        });*/
        myMap.controls.add(myButton3, {
            float: "none",
            position: {
                top: 40,
                left: 10
            },
            selectOnClick: false
        });

    };



    function addMarker(location) {    
        var geoPlacemark = new ymaps.Placemark(
            location,
            {iconContent: placemarkId},
            {draggable: true})
       
        
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
            if(tagN=="0") {
                geoPlacemark.options.set("preset", 'islands#redIcon');
            }
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
                text += item.geometry.getCoordinates()[0].toFixed(5);
                text += "&lon_to=";
                text += item.geometry.getCoordinates()[1].toFixed(5);
                text += "\n";
                pointsCount+=1;
            }
        });

        document.getElementById("routes-links").rows = pointsCount + 1;
        $('#routes-links').val( text );

        //computeBestRoute();
        //mapToImage();
    };

    function min(x,y) {
        if( x < y ) {
            return x;
        } else {
            return y;
        }
    };

    function mapToImage() {

        var url = "https://static-maps.yandex.ru/1.x/?ll=";
        url += myMap.getCenter()[1]+","+myMap.getCenter()[0];
        url += "&size="+ min(650,$('#map-container').width()) + ",400";
        url += "&z=" + myMap.getZoom();
        url += "&l=map&pt=";
        
        myMap.geoObjects.each(function (item) {
            if(item.geometry && item.geometry.getType() == "Point") {
                url += item.geometry.getCoordinates()[1] + ","+item.geometry.getCoordinates()[0];
                url += ",pm2dbl" + item.properties.get("iconContent") + "~";
            }
        });
        url = url.substring(0,url.length-1);
        document.getElementById("image-map-container").src = url;
    }

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
        var pointsCount = permutation.length;
        for(var i = 0; i < pointsCount - 1;i++) {
            time+=distances[permutation[i]][permutation[i+1]];
        }
        return time;
    }

    function getWay(placemarks_all) {
        var placemarks = [];
        var start_point;
        var startId;
        var inputArr =[];
        for(var i = 0; i < placemarks_all.length; i++ ) {
            if(placemarks_all[i].properties.get("iconContent") != 0 ) {
                placemarks.push(placemarks_all[i])
                inputArr.push(i)
            } else {
                startId = i;
                start_point = placemarks_all[i];
            }
        }
        var pointsCount = placemarks.length;

        var permutations = permutator(inputArr);

        for(var i = 0; i < permutations.length; i++) {
            permutations[i].push(startId);
            permutations[i].unshift(startId);
        }

        var bestId = 0;
        var bestTime = getTime(permutations[0]);

        for( var i = 1; i < permutations.length; i++) {
            var currentTime = getTime(permutations[i]);
            if( currentTime < bestTime) {
                bestTime = currentTime;
                bestId = i;
            }
        }
        return permutations[bestId];

    };
    function getBestRoute() {
        myRoute && myMap.geoObjects.remove(myRoute);
        var placemarks = [];
        distances = [];
        myMap.geoObjects.each(function (item) {
            if(item.geometry && item.geometry.getType() == "Point") {
                placemarks.push(item);
            };
        });
        var pointsCount = placemarks.length;

        var distancesCount = pointsCount * pointsCount;

        for(var i=0; i < pointsCount; i++) {
            distances[i]=[]
            for(var j=0; j < pointsCount; j++) {
                (function(i,j) {
                    ymaps.route(
                        [placemarks[i].geometry.getCoordinates(),
                        placemarks[j].geometry.getCoordinates()]).then(
                            function (route) {
                                distances[i][j] = route.getTime();
                                distancesCount-=1;
                                if(distancesCount==0 ){
                                    var bestWay = getWay(placemarks);
                                    var bestWayDescription = "";
                                    var wayPoints = [];

                                    var text = "Лучший маршрут\n";

                                    for(var p = 0; p < bestWay.length; p++) {
                                        text += "точка: " + placemarks[bestWay[p]].properties.get("iconContent");
                                        text += " корды: ";
                                        text += "yandexnavi://build_route_on_map?lat_to=";
                                        text += placemarks[bestWay[p]].geometry.getCoordinates()[0].toFixed(5);
                                        text += "&lon_to=";
                                        text += placemarks[bestWay[p]].geometry.getCoordinates()[1].toFixed(5);
                                        text += "\n";

                                        wayPoints.push({ type: 'wayPoint', point: placemarks[bestWay[p]].geometry.getCoordinates()});
                                    };
                                    console.log("best way: " + bestWayDescription);
                                    document.getElementById("routes-links").rows = pointsCount + 2;
                                    $('#routes-links').val( text );

                                    ymaps.route(wayPoints, {
                                         mapStateAutoApply: true
                                     }).then(function (route) {
                                         route.getPaths().options.set({
                                            strokeWidth: 6,
                                            strokeColor: 'ff0000ff',
                                            opacity: 0.9
                                        });
                                        myRoute = route.getPaths();
                                        myMap.geoObjects.add(route.getPaths());
                                     });

                                };
                            },
                            function (error) {
                               alert('Нет пути =(');
                            }
                        );
                })(i,j);
            };         
        };
    };

        /*
        37.620070,55.753630& \
size=450,450&z=13&l=map&pt=37.620070,55.753630,pmwtm1~37.64,55.76363, \ 
pmwtm99
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
*/

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

    $('#point-description').keyup(function(event){
        if(event.keyCode == 13){
            $("#sumbit-point").click();
        }
    });
})
