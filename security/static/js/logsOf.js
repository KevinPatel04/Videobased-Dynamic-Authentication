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
      data=[]
      $("#name").html("");
      $("#contactNo").html("Contact number: ");
      $('#designation').html("")
      $("#expiryDate").html("Expires on: ")
      $("#registeredBy").html("Registered by: ")
      let snap = JSON.stringify(snapshot);
      root = JSON.parse(snap);
      registeredPerson = root["RegisteredPerson"];
      logs = root["Logs"];
      profileImage = registeredPerson[id].dp;
      $("#name").append(name);
      $("#contactNo").append(id);
      $("#p").attr("src", profileImage);
      $('#designation').append(registeredPerson[id].Designation)
      $("#expiryDate").append(registeredPerson[id].ExpiryDate);
      $("#registeredBy").append(registeredPerson[id].RegisteredBy);

      for (dates in logs) {
        for (total_entries in logs[dates][id]) {
          
          if (logs[dates][id][total_entries]) {
            var data2 = [];
            
            data2.push(dates);
            data2.push(total_entries);

            if (logs[dates][id][total_entries]["Intime"])
              data2.push(logs[dates][id][total_entries]["Intime"]);
            if (logs[dates][id][total_entries]["Outtime"]) {
              data2.push(logs[dates][id][total_entries]["Outtime"]);
            } else {
              data2.push("-");
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
          { title: "Times" },
          { title: "In Time" },
          { title: "Out Time" }
        ]
      });
      
    });
  } else if (urlParams.has("name") & !urlParams.has("id")) {
    $(".col-lg-3 col-md-3 col-sm-3").remove();
    $(".card").remove();
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
                if (registeredPerson[contactNo])
                  data2.push(registeredPerson[contactNo].name);
                else {
                  data2.push("Unnamed");
                }
                data2.push(contactNo);
                data2.push(dates);
                data2.push(total_entries);
                if (logs[dates][contactNo][total_entries]["Intime"])
                  data2.push(logs[dates][contactNo][total_entries]["Intime"]);
                if (logs[dates][contactNo][total_entries]["Outtime"]) {
                  data2.push(logs[dates][contactNo][total_entries]["Outtime"]);
                } else {
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
            { title: "Name" },
            { title: "Contact No." },
            { title: "Date" },
            { title: "Times" },
            { title: "In Time" },
            { title: "Out Time" }
          ]
        });
        $("#dataTable").on("click", "tr", function() {
          rowData = $("#dataTable")
            .DataTable()
            .row(this)
            .data();
          splittedName = rowData[0].split(" ");
          if (!splittedName[1]) splittedName[1] = "";
          $(location).attr(
            "href",
            "logsOf?name=" +
              splittedName[0] +
              splittedName[1] +
              "&" +
              "id=" +
              rowData[1]
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
  }
});
$(document).on("submit", "#profile2", function(e) {
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
        success: function () {
          //alert("Date changed");
          //flag=0;
        }
      });
});
