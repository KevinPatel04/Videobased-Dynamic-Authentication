var firebaseConfig = {
  apiKey: "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
  authDomain: "videobase-dynamic-auth-system.firebaseapp.com",
  databaseURL: "https://videobase-dynamic-auth-system.firebaseio.com",
  projectId: "videobase-dynamic-auth-system",
  storageBucket: "videobase-dynamic-auth-system.appspot.com",
  messagingSenderId: "542414051699",
  appId: "1:542414051699:web:4625898e615fba4dc88d06"
};
var id,
  name,
  inTimeChecked,
  outTimeChecked,
  selectedDate1,
  selectedDate2,
  splittedDate1,
  splittedDate2,
  isDate,
  profileImage,
  logs,
  root,
  keys = [],
  registeredPerson;
data = [];

firebase.initializeApp(firebaseConfig);

$(document).ready(function() {

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("name") & urlParams.has("id")) {
    name = urlParams.get("name");
    id = urlParams.get("id");
    

    var rootRef = firebase.database().ref();
    rootRef.on("value", async function(snapshot) {
      $('#profile').removeClass('d-none');
      data=[]
      $('.preloader').addClass('d-none');
      $('#pen').removeClass('d-none');
      $("#name").html("");
      $("#contactNo").html("");
      $('#designation').html("")
      //$("#expiryDate").html("");
      $("#expiryDate").html("ID Validity: ")
      $("#registeredBy").html("Registered by: ")
      $("#registeredOn").html("");
      $("#registeredOn").html("Registered on: ")
      let snap = JSON.stringify(snapshot);
      root = JSON.parse(snap);
      registeredPerson = root["RegisteredPerson"];
      logs = root["Logs"];
      profileImage = registeredPerson[id].url[0];
      $("#name").append(name);
      $("#contactNo").append(id);
      $("#p").attr("src", profileImage);
      $('#designation').append(registeredPerson[id].Designation)
      
      date = registeredPerson[id].ExpiryDate.split('-');
      $("#expiryDate").append([date[1],date[2],date[0]].join('-'));
      $("#duration3").min = date[0]+'-'+date[1]+'-'+date[2];
  
      $("#registeredBy").append(registeredPerson[id].RegisteredBy);
      d = new Date(registeredPerson[id].RegisteredOn);
      month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

      $("#registeredOn").append([day,month,year].join('-'));

      for (dates in logs) {
        for (total_entries in logs[dates][id]) {
          
          if (logs[dates][id][total_entries]) {
            var data2 = [];
            
            data2.push(dates);
            

            if (logs[dates][id][total_entries]["Intime"])
              data2.push("<center><i onclick=\"openmodal('"+logs[dates][id][total_entries]["InURL"]+"','"+registeredPerson[id].name+": "+dates+" "+logs[dates][id][total_entries]["Intime"]+"')\" class='fas fa-2x fa-image text-success'></i></center>");
              data2.push(logs[dates][id][total_entries]["Intime"]);
            if (logs[dates][id][total_entries]["Outtime"]) {
              data2.push("<center><i onclick=\"openmodal('"+logs[dates][id][total_entries]["OutURL"]+"','"+registeredPerson[id].name+": "+dates+" "+logs[dates][id][total_entries]["Outtime"]+"')\" class='fas fa-2x fa-image text-danger'></i></center>");
              data2.push(logs[dates][id][total_entries]["Outtime"]);
            } else {
              data2.push("NA");
              data2.push("He is In.");
            }
          }
          data.push(data2);
        }
      }

      $("#dataTable").DataTable({
        retrieve: true,

        data: data,
        columns: [
          { title: "Date" },
          { title: "Entry Image" },
          { title: "In Time" },
          { title: "Exit Image" },
          { title: "Out Time" }
        ]
      });
    });
  } else if (urlParams.has("name") & !urlParams.has("id")) {
    
    $('#tablediv').removeClass('col-lg-8 col-md-8 col-sm-8')
    $('#tablediv').addClass('col-lg-12 col-md-12 col-sm-12')

    name = urlParams.get("name");
    if (name == "undefined") {
      $(location).attr("href", "logsOf?name=*");
    } else {
      var rootRef = firebase.database().ref();
    rootRef.on("value", async function(snapshot) {
      
       let snap = JSON.stringify(snapshot);
      root = JSON.parse(snap);
      registeredPerson = root["RegisteredPerson"];
      logs = root["Logs"];
      
        for (dates in logs) {
          for (contactNo in logs[dates]) {
            for (total_entries in logs[dates][contactNo]) {
              if (logs[dates][contactNo][total_entries]) {
                var data2 = [];
                if (registeredPerson[contactNo]){
                  data2.push("<center><img src='"+registeredPerson[contactNo].url[0]+"' style='height:40px;width:40px'></center>")
                  data2.push(registeredPerson[contactNo].name);
                } else {
                  data2.push("Unnamed");
                }
                data2.push(contactNo);
                data2.push(dates);
                if (logs[dates][contactNo][total_entries]["Intime"])
                  data2.push("<center><i onclick=\"openmodal('"+logs[dates][contactNo][total_entries]["InURL"]+"','"+registeredPerson[contactNo].name+": "+dates+" "+logs[dates][contactNo][total_entries]["Intime"]+"')\" class='fas fa-2x fa-image text-success'></i></center>");
                  data2.push(logs[dates][contactNo][total_entries]["Intime"]);
                if (logs[dates][contactNo][total_entries]["Outtime"]) {
                  data2.push("<center><i onclick=\"openmodal('"+logs[dates][contactNo][total_entries]["OutURL"]+"','"+registeredPerson[contactNo].name+": "+dates+" "+logs[dates][contactNo][total_entries]["Outtime"]+"')\" class='fas fa-2x fa-image text-danger'></i></center>");
                  data2.push(logs[dates][contactNo][total_entries]["Outtime"]);
                } else {
                  data2.push("NA");
                  data2.push("He is In.");
                }
              }
              data.push(data2);
            }
          }
        }
        $("#dataTable").DataTable({
          data: data,
          columns: [
            { title: "Profile"},
            { title: "Name" },
            { title: "Contact No." },
            { title: "Date" },
            { title: "Entry Image" },
            { title: "In Time" },
            { title: "Exit Image" },
            { title: "Out Time" },
            
          ]
        });
        var l = 80
        var info = $("#dataTable_info").text()

        $("#dataTable").on("dblclick", "tr", function() {
          rowData = $("#dataTable")
            .DataTable()
            .row(this)
            .data();
          //splittedName = rowData[1].split(" ");
          //if (!splittedName[1]) splittedName[1] = "";
          $(location).attr(
            "href",
            "logsOf?name=" +
              rowData[1]+
              "&" +
              "id=" +
              rowData[2]
          );
        });
        if (name == "*") {
          $("#dataTable")
            .DataTable()
            .search("")
            .draw();
        } else {
          $("#dataTable")
            .DataTable()
            .search(name)
            .draw();
        }
      });
    }
  } else {

    $('#tablediv').removeClass('col-lg-8 col-md-8 col-sm-8')
    $('#tablediv').addClass('col-lg-12 col-md-12 col-sm-12')

    var rootRef = firebase.database().ref();
    rootRef.on("value", async function(snapshot) {
      
      let snap = JSON.stringify(snapshot);
      root = JSON.parse(snap);
      logs = root["NotRegistered"];
      
        for (dates in logs) {
          for (contactNo in logs[dates]) {
            for (total_entries in logs[dates]) {
              if (logs[dates][total_entries]) {
                var data2 = [];
                data2.push("Unknown");
                data2.push(dates);
                if (logs[dates][total_entries]["Intime"])
                  data2.push("<center><i onclick=\"openmodal('"+logs[dates][total_entries]["InURL"]+"','Unknown: "+dates+" "+logs[dates][total_entries]["Intime"]+"')\" class='fas fa-2x fa-image text-danger'></i></center>");
                  data2.push(logs[dates][total_entries]["Intime"]);
              }
              data.push(data2);
            }
          }
        }
        $("#dataTable").DataTable({
          data: data,
          columns: [
            { title: "Name" },
            { title: "Date" },
            { title: "Entry Image" },
            { title: "In Time" },
          ]
        });
      });
    }
});
$(document).on("submit", "#profile2", function(e) {
  $("#profile2").validate()
  const urlParams = new URLSearchParams(window.location.search);
  mno=urlParams.get('id');
  e.preventDefault()
  $.ajax({
        type: "POST",
        url: '/user/dateChanged',
        data: {
          mno:mno,
          duration: $("#duration3").val(),
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()
        },
        success: function (data) {
          if(data == "True"){
            alert("Validity Increased");
            $('#exampleModal').removeClass('show');
            $('body').removeClass('modal-open');
          }
          else{
            alert("Invalid Date Enter Date After Current Date");
            $('#exampleModal').removeClass('show');
            $('body').removeClass('modal-open');
            
          }
        },
        error: function(){
          alert("Error due to some problem");
        }
      });
});
