var firebaseConfig = {
    apiKey: "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
    authDomain: "videobase-dynamic-auth-system.firebaseapp.com",
    databaseURL: "https://videobase-dynamic-auth-system.firebaseio.com",
    projectId: "videobase-dynamic-auth-system",
    storageBucket: "videobase-dynamic-auth-system.appspot.com",
    messagingSenderId: "542414051699",
    appId: "1:542414051699:web:4625898e615fba4dc88d06"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  function unregistered(){
    $(location).attr('href',"logsOf")
  }
  
  var rootRef = firebase
    .database()
    .ref()
    .child("RegisteredPerson");
  
  rootRef.on("value", async function(snapshot) {
    let snap = JSON.stringify(snapshot);
    data = JSON.parse(snap);
    //console.log(data)
  
  var searchField;
    $(document).ready(function() {
      $.ajaxSetup({ cache: false });
      $("#search").keyup(function() {
        $("#result").html("");
        $("#state").val("");
        
        searchField = $("#search").val();
        var expression = new RegExp(searchField, "i");
        $.each(data, function(key, value) {
          if (
            data[key].name.search(expression) != -1 ||
            key.search(expression) != -1
          ) {
            $("#result").removeClass("d-none")
            $("#result").append(
              "<a href='/logsOf?name="+data[key].name+"&"+"id="+key+"' style='width:220px;margin-top:1px;padding-top:3px;padding-bottom:3px;' class='row bg-light rounded-sm border-top shadow-lg list-group-item-action'><div class='col-3'><img id=\"dynamicImage\" style=\"height:40px;width:40px;\" class='img-responsive' src=\""+data[key].url[0]+"\"/></div><div class='col-9'><span class='font-weight-300'>"+data[key].name
                +"</span><br/><small class='text-sm text-secondary'>" + key + "</small></div></a>"
            );
          }
        });
      });

      $( "#result" )
  .mouseover(function() {
      $("#result").removeClass("d-none");
  })
  .mouseout(function() {
    $("#result").addClass("d-none");
  });

        $("#butt").click(function(){
          //console.log(searchField)
          $(location).attr('href',"logsOf?name="+searchField)
          //console.log(date)
        });
      
    });
  });
  /*---------------Live streaming-----------------*/
  var protocol = 'HLS';
      var streamName = 'security';

        // Step 1: Configure SDK Clients
        var options = {
          accessKeyId: 'AKIAWZWHC4N233IMV4HK',
          secretAccessKey: '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',
          sessionToken: undefined,
          region: 'ap-south-1',
          endpoint: undefined
        }
        var kinesisVideo = new AWS.KinesisVideo(options);
        var kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(options);
        
        // Step 2: Get a data endpoint for the stream
          console.log('Fetching data endpoint');
          kinesisVideo.getDataEndpoint({
            StreamName: streamName,
            APIName: "GET_HLS_STREAMING_SESSION_URL"
          }, function (err, response) {
            if (err) { return console.error(err); }
            console.log('Data endpoint: ' + response.DataEndpoint);
            kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(response.DataEndpoint);
            var consoleInfo = 'Fetching ' + protocol + ' Streaming Session URL';
              console.log(consoleInfo);
            
            kinesisVideoArchivedContent.getHLSStreamingSessionURL({
              StreamName: streamName,
              PlaybackMode: 'LIVE',
              HLSFragmentSelector: {
                FragmentSelectorType: 'SERVER_TIMESTAMP',
                TimestampRange: "LIVE" === "LIVE" ? undefined : {
                  StartTimestamp: new Date($('#startTimestamp').val()),
                  EndTimestamp: new Date($('#endTimestamp').val())
                }
              },
              //ContainerFormat: 'FRAGMENTED_MP4',
              DiscontinuityMode: 'ALWAYS',
              //DisplayFragmentTimestamp: 'NEVER',
              //DisplayFragmentNumber: 'NEVER',
              MaxMediaPlaylistFragmentResults: parseInt(null),
              Expires: 3600
            }, function (err, response) {
              if (err) { return console.error(err); }
              console.log('HLS Streaming Session URL: ' + response.HLSStreamingSessionURL);    
              var playerElement = $('#videojs');
                playerElement.show();
                var player = videojs('videojs');
                console.log('Created VideoJS Player');
                player.src({
                  src: response.HLSStreamingSessionURL,
                  type: 'application/x-mpegURL'
                });
                console.log('Set player source');
                player.play();
                console.log('Starting playback');
              
            });
          });
  
