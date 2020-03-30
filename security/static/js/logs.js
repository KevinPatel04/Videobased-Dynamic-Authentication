var firebaseConfig = {
    apiKey: "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
    authDomain: "videobase-dynamic-auth-system.firebaseapp.com",
    databaseURL: "https://videobase-dynamic-auth-system.firebaseio.com",
    projectId: "videobase-dynamic-auth-system",
    storageBucket: "videobase-dynamic-auth-system.appspot.com",
    messagingSenderId: "542414051699",
    appId: "1:542414051699:web:4625898e615fba4dc88d06"
  };
  var flag;
  
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  function unregistered(){
    $(location).attr('href',"logsOf")
  }
  function myCheck(){
    var id = document.getElementById("duration");
    var id1 = document.getElementById("duration1");
    var checkId = document.getElementById("check1");
  
    if(checkId.checked == true){
      id.style.display = "none";
      id1.style.display = "none";
    }
    else{
      id.style.display = "block";
      id1.style.display = "block";
    }
  }

   function openCalender(){
    var id = document.getElementById("search");
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    
    //alert(id.getAttribute("type"));
  
    if(id.type == "date"){
      id.setAttribute("type","search");
  
    } else{
      id.setAttribute("type","date");
    }
  
   }
   
   function getUserData(userID){
    console.log("Userid---" + userID);
    
    return db.ref('RegisteredPerson/' + userID + "/").once('value').then(function (snapshot) {
      let snap = JSON.stringify(snapshot);
      //console.log("SNAP----"+snap1)
      data1 = JSON.parse(snap);
      //console.log("-----"+data1.name)
      return {
        name: data1.name,
        designation: data1.Designation,
        key: userID
      };
    });
    
  }
  $(document).on("submit", "#profile", function(e) {
    var nullValues = 0;
    var mobilenumber = false;
    var input = document.querySelectorAll("input");
    //console.log("check box"+ document.getElementById("check1").checked)
    
    for (var i = 1; i < input.length; i++) {
      //console.log(input[i].id+"-"+input[i].value)
      if (input[i].id != "check1") {
      if (input[i].value == "") {
        if(input[i].id=="duration1" && document.getElementById("check1").checked==true){
          continue;
        }
        else{
          alert(input[i].name + " cannot be null.");
          nullValues += 1;
        }
      }
      if (input[i].id == "mno") {
        if (input[i].value.length == 10) {
          mobilenumber = true;
        } else {
          alert("Please enter proper mobile number.");
        }
      }
    }
  }
    e.preventDefault();
    console.log("Flag is:"+flag)
    if ((nullValues == 0) & mobilenumber & flag) {
      $.ajax({
        type: "POST",
        url: "/user/addPerson",
        data: {
          name: $("#name").val(),
          designation: $("#designation").val(),
          mno: $("#mno").val(),
          pEmp: $("#check1").val(),
          duration: $("#duration1").val(),
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function () {
          alert("Created new user");
          flag=0;
        }
      });
    }
    else if(flag==0){
      alert("You need to capture image");
    }
  });

  $('#capture').click(function () {

     if ($("#mno").val() != "") {
      $.ajax({
        type: "POST",
        url: "capture_img",
        /*async: true,*/
        data: { mno: $("#mno").val(),
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
      },
        success: function () {
          alert("Image Captured");
          flag =1;
        }
      });
  }
  else{
    alert("You need to enter Number to Capture image");
  }

      /*return false;*/
    });
    var log = [];
    var logcnt = 0;
    var rmv = 0;
    var rootRef = {};
    var fullDate = "";
    var dbRef = {};
    var data = {};
    var searchField;
    

    $(document).ready(function() {
      $("#video_stream").load("monitor");
      var rootRef = firebase
      .database()
      .ref()
      .child("RegisteredPerson");
    
    rootRef.on("value", async function(snapshot) {
      let snap = JSON.stringify(snapshot);
      var data = JSON.parse(snap);
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
    var d = new Date();

      var year = d.getFullYear();
      var mon = String(parseInt(d.getMonth()) + 1);
      var date = d.getDate();
      if (parseInt(d.getMonth()) < 10) {
        mon = "0" + mon;
      }

      if (parseInt(date) < 10) {
        date = "0" + date;
      }
      fullDate = year + "-" + date + "-" + mon;
      //db = firebase.database();
      mainRef = db.ref("Logs/logsFlag");
      mainRef.on("value", async function (snapshot) {
        let snap = JSON.stringify(snapshot);
        userKey = JSON.parse(snap);
        userKey = String(userKey);
        console.log("++++Logs+++" + userKey);  
      rootRef = db.ref("Logs/" + fullDate +"/" + userKey);
      rootRef.once("value").then(function (snapshot) {
        let snap = JSON.stringify(snapshot);
        data = JSON.parse(snap);
        var countKey = Object.keys(data).length-1;
        
        dbRef = db.ref("Logs/" + fullDate+"/" + userKey +"/" + countKey);
        flagRef = db.ref("Led");
        flagRef.set({
          flag:1
        })
        dbRef.once("value").then(function(snap) {
          logs = JSON.stringify(snap);
          logs1 = JSON.parse(logs);
          var name;
          //console.log("----->"+getUserData(8260318435));
        
          //console.log("logs1 = " + logs1)
        
          if(logcnt >= 5){
            var id = ".logbar"+rmv.toString();
            console.log("-->"+ id)
            $(id).remove();
            rmv++;
          }
          getUserData(userKey).then(function (userData) {
            console.log("Check variable"+logs1.OutURL)
            console.log("name = " + userData.name)
            if(logs1.OutURL=="URL"){
              console.log(data[countKey].InURL);
              // $("#logs").prepend('<div class=logbar'+logcnt+'>'+'<div class="card mb-3 border-green">' + '<div class="row no-gutters">' +
              //   '<div class="col-md-8">' +
              //   '<div class="card-body">' +
              //   '<h5 class="card-title">' + userData.name + '</h5>' +
              //   '<p class="card-text">' + userData.designation + '<br>' + logs1.Intime + '</p>' +
              //   '</div>' +
              //   '</div>' +
              //   '<div class="col-md-4">' +
              //   '<img src="'+ data[countKey].InURL +'" class="card-img">' +
              //   '</div>' +
              //   '</div>' +
              //   '</div></div>' 
              //   );
              $("#logs").prepend('<div class=logbar'+logcnt+'>'+'<div class="card mb-3 border-green">' + '<div class="row no-gutters" style="height: 120px;">' +
                '<div class="col-md-8">'+
                '<div class="card-body">' +
                '<h5 class="card-title">' + userData.name + '</h5>' +
                '<div >' + userData.designation + '</div>' + 
                '<span class="card-text text-muted" style="font-size:12px;">' + userData.key + '</span>' +
                '<small class="float-right  text-black-50"><i class="far fa-clock"></i> ' + logs1.Intime + '</small>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<img src="'+ data[countKey].InURL +'" class="card-img" style="height:100%;">' +
                '</div>' +
                '</div>' +
                '</div></div>' 
                );

                logcnt++;
            }
            else{
              // $("#logs").prepend('<div class=logbar' + logcnt + '>' +'<div class="card mb-3 border-red">' + '<div class="row no-gutters">' +
              //   '<div class="col-md-8">' +
              //   '<div class="card-body">' +
              //   '<h5 class="card-title">'+userData.name + '</h5>' +
              //   '<p class="card-text">' + userData.designation + '<br>'  + logs1.Outtime + '</p>' +
              //   '</div>' +
              //   '</div>' +
              //   '<div class="col-md-4">' +
              //   '<img src="' + data[countKey].OutURL + '" class="card-img">' +
              //   '</div>' +
              //   '</div>' +
              //   '</div>'
              // );

              $("#logs").prepend('<div class=logbar'+logcnt+'>'+'<div class="card mb-3 border-red">' + '<div class="row no-gutters" style="height: 120px;">' +
                '<div class="col-md-8">'+
                '<div class="card-body">' +
                '<h5 class="card-title">' + userData.name + '</h5>' +
                '<div >' + userData.designation + '</div>' + 
                '<span class="card-text text-muted" style="font-size:12px;">' + userData.key + '</span>' +
                '<small class="float-right  text-black-50"><i class="far fa-clock"></i> ' + logs1.Outtime + '</small>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<img src="'+ data[countKey].OutURL +'" class="card-img" style="height:100%;">' +
                '</div>' +
                '</div>' +
                '</div></div>' 
                );


                logcnt++;
              }
            });
            mainRef.set("");
            //console.log(logcnt);
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
  
