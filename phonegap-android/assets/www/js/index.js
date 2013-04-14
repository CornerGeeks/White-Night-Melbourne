/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    config: {
        DEFAULT_LOCATION: new google.maps.LatLng(-37.816667, 144.966667),  // default map center
        DEFAULT_ZOOM: 16,                      // default map zoom level
        MAP_ID: "#map_canvas",
        DETAILS_MAP_ID: "#map_canvas_detail",
        prefix: 'http://app.whitenightmelbourne.com.au/index.php/', // prefix for URL calls to API
        debug_local: false                           // for local testing
    },
    data: {
        precinct_id: undefined,         // precinct selected. ID
        program_index: undefined,       // program selected. index in current_list
        program_list: undefined,        // list based on precinct selected
        map_program_list: undefined,    // list that populates the map. all events
        current_list: undefined,        // list that is currently being refered to. due to fact that map can be opened any time
        curr_map_marker: undefined      // for detail map view. use to not clear marker if viewing same marker
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    viewPrecincts: function(data){

    },
    viewProgram: function(data, callback){
        var template = $("#program-page").find(".template.row");
        var list = $("#program-page .list").eq(0).empty();

        for(var i = 0; i < data.events.length; i++){
            var d = data.events[i];
            var title = d.title;
            var row = template.clone();
            row.removeClass("template");
            row.find(".title").text(title);
            var url = row.find(".url");
            url.attr("data-url", i).attr('href', "?eid=" + d.id + url.attr('href'));
            list.append(row);
            var map = $("#btnmap");
            map.attr('href', "?eid=" + d.id + map.attr('href'));
        }
        try { list.listview("refresh"); } catch(err){}
        if(callback)
            $(list).find("li a").click(function(e){
                callback(e, $(this));
            });;
    },
    viewDetails: function(d){
        /*
                {
                "id":"106",
                "precinct_id":"1",
                "image_url":"http:\/\/app.whitenightmelbourne.com.au\/upload\/uptown_brown.jpg",
                "presented_by":"",
                "description":"Singing gentleman-adventurer and inventor ?Uptown? Brown brings his Goodtimes Gyratorscope 1920s-50s repertoire to downtown Melbourne.",
                "event_date":"Saturday 23 February 2013",
                "start_time":"07:00:00 PM",
                "end_time":"07:00:00 AM",
                "venue_name":"Flinders Street",
                "address_one":"",
                "address_two":"",
                "city":"Melbourne",
                "post_code":"3000",
                "price":"FREE",
                "url_to_purchase":"",
                "latitude":"-37.816984",
                "longitude":"144.969425",
                "title":"\"Uptown\" Brown!",
                "state":"","country":""}
        */        
        $("#d_title").text(d.title);
        $("#d_presented_by").text(d.presented_by);
        $("#d_date").text(d.event_date);
        $("#d_time_start").text(d.start_time);
        $("#d_time_end").text(d.end_time);
        $("#d_location").text(d.venue_name);
        $("#d_address_one").text(d.address_one);
        $("#d_url_to_purchase").text(d.url_to_purchase).attr('href', d.url_to_purchase);
        $("#d_price").text(d.price);
        $("#d_description").html(htmlForTextWithEmbeddedNewlines(d.description));
        $("#d_image").attr("src",d.image_url);
    },
    viewUtilMarkerID: function(data){
        return data.latitude + "_" + data.longitude;
    },
    viewDetailsMap: function(data){
        var the_map = $(app.config.DETAILS_MAP_ID);
        var pos = new google.maps.LatLng(data.latitude, data.longitude);
        if(app.data.curr_map_marker !== app.viewUtilMarkerID(data)){ // dont clear and add marker if it is the same
            the_map.gmap('clear', 'markers');
            the_map.gmap('addMarker', 
                { 
                    'bounds':true, 
                    'position': pos
                }
            )
        }
        the_map.gmap('option', 'zoom', app.config.DEFAULT_ZOOM);
        the_map.gmap('option', 'center', pos);
    },
    viewFixMap: function(page_id, map_id){
        var height = 129;
        var map_object = $(map_id);
        map_object.height($(window).height() - height);
        $('#'+page_id).height($(window).height() - height).css('min-height', $(window).height() - height + 'px');
        map_object.gmap('refresh', 1);
    },
    viewMap: function(data){
        var the_map = $(app.config.MAP_ID);
        the_map.gmap({'center': app.config.DEFAULT_LOCATION, 
            'zoom': app.config.DEFAULT_ZOOM, 
            'mapTypeControl': false}).bind('init', function(evt, map) {

            $(map).click(function(e){

            });
            // drag map. load search after 1 second after drag ends
        });
        for(var i = 0; i < data.events.length; i++){
            var ia = i;
            var d = data.events[i];

            the_map.gmap('addMarker', 
                { 
                    'bounds':true, 
                    'position': new google.maps.LatLng(d.latitude, d.longitude) 
                }, 
                function(map, marker){ 
                    marker.id = i;
                    $(marker).click(function() {
                        var d = app.data.map_program_list.events[marker.id];
                        if(typeof(infowindow) != 'undefined') infowindow.close();
                        else infowindow = new google.maps.InfoWindow();
                        infowindow.setContent(
                            '<a href="#detail-page" onclick="app.data.current_list = app.data.map_program_list; app.data.program_index = ' + marker.id + ';return false;">' + d.title + "</a>"  +
                            "<div>" + d.start_time + " - " + d.end_time + "</div>" + 
                            "<div>" + d.price + "</div>" +
                            ""
                        );
                        infowindow.setPosition(marker.getPosition());
                        infowindow.open(map);
                    });
                }
            );
        }
    }
};


// http://stackoverflow.com/questions/4535888/jquery-text-and-newlines
function htmlForTextWithEmbeddedNewlines(text) {
    var htmls = [];
    var lines = text.split(/\n/);
    // The temporary <div/> is to perform HTML entity encoding reliably.
    //
    // document.createElement() is *much* faster than jQuery('<div/>')
    // http://stackoverflow.com/questions/268490/
    //
    // You don't need jQuery but then you need to struggle with browser
    // differences in innerText/textContent yourself
    var tmpDiv = jQuery(document.createElement('div'));
    for (var i = 0 ; i < lines.length ; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
    }
    return htmls.join("<br>");
}

//////////////////////////////////////////////////////////////////////
// precincts page - 1
$(document).ready(function(){
    $("#precincts-page ul li a").click(function(e){
        e.preventDefault();
        app.data.precinct_id = $(this).attr("data-url");
    });
});

// precincts page - 1
//////////////////////////////////////////////////////////////////////
// map page - 1
$(document).on('pageshow', "#map-page", function () {
    
    app.viewFixMap("map-page", app.config.MAP_ID);
    if(!app.data.map_program_list){
        $.getJSON(app.config.prefix+"event/eventlist", {}, function(data) {
            app.data.map_program_list = data;
            app.viewMap(app.data.map_program_list);
        });
    }
});     

// map page - 0
//////////////////////////////////////////////////////////////////////
// program page - 1
$(document).on('pagebeforeshow', "#program-page", function () {
    
    var precinct_id = app.data.precinct_id;
    if(!precinct_id || precinct_id == 0){
        url = "event/eventlist";
    }
    else{
        url = "precinct/eventlist?precinct_id="+precinct_id;
        if(app.config.debug_local) url = "precinct/eventlist%3fprecinct_id="+precinct_id;
    }
    $.getJSON(app.config.prefix+url, {}, function(data) {
        app.data.program_list = data;
        app.viewProgram(data, function(e, item){
            e.preventDefault();
            app.data.current_list = app.data.program_list;
            app.data.program_index = item.attr("data-url");
        });
    });             
});     
// program page - 0
//////////////////////////////////////////////////////////////////////
// detail page - 1
$(document).on('pagebeforeshow', "#detail-page", function () {
    if(!app.data.current_list || !app.data.program_index){
        $.mobile.changePage( "#program-page", { transition: "slide"} );
        return;
    }
    var d = app.data.current_list.events[app.data.program_index];
    app.viewDetails(d);

});     
// detail page - 0
//////////////////////////////////////////////////////////////////////
// detail map page - 1

$(document).ready(function(){
    $(app.config.DETAILS_MAP_ID).gmap({'center': app.config.DEFAULT_LOCATION, 
        'zoom': app.config.DEFAULT_ZOOM, 
        'mapTypeControl': false}).bind('init', function(evt, map) {
    });

});
$(document).on('pageshow', "#detail-map-page", function () {
    if(!app.data.current_list || !app.data.program_index){
        $.mobile.changePage( "#program-page", { transition: "slide"} );
        return;
    }
    var d = app.data.current_list.events[app.data.program_index];
    app.viewDetailsMap(d);
    app.data.curr_map_marker = app.viewUtilMarkerID(d);
    app.viewFixMap("detail-map-page", app.config.DETAILS_MAP_ID);
});     
// detail map page - 0
//////////////////////////////////////////////////////////////////////   
