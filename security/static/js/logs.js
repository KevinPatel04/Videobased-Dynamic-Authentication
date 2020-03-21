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
  
  
  var rootRef = firebase
    .database()
    .ref()
    .child("RegisteredPerson");
  
  rootRef.on("value", async function(snapshot) {
    let snap = JSON.stringify(snapshot);
    data = JSON.parse(snap);
    console.log(data)
  
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
            
            $("#result").append(
              '<ul style="list-style-type:none;padding:5px;border-bottom: 1px solid black;border-top: 1px solid black">' +
                "<li>" +
                "<img  id=\"dynamicImage\" style=\"height:50px;width:50px;padding:1px\" src=\""+data[key].dp+"\"/>"+
                data[key].name +" "+key+
                "</li>" +
                
                "</ul>"
            );
          }
        });
      });
        
        $("#result").on("click", "ul", function() {
          var click_text = $(this)
            .text()
            .split(" ");
          console.log(click_text[2]);
          $("#result").html("");
          
          $(location).attr('href',"logsOf?name="+click_text[0]+click_text[1]+"&"+"id="+click_text[2])
          //console.log(date)
        });
        $("#butt").click(function(){
          //console.log(searchField)
          $(location).attr('href',"logsOf?name="+searchField)
          //console.log(date)
        });
      
    });
  });
  