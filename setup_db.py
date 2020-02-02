import pyrebase
from datetime import datetime
import pytz

firebaseConfig = {
  apiKey: "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
  authDomain: "videobase-dynamic-auth-system.firebaseapp.com",
  databaseURL: "https://videobase-dynamic-auth-system.firebaseio.com",
  projectId: "videobase-dynamic-auth-system",
  storageBucket: "videobase-dynamic-auth-system.appspot.com",
  messagingSenderId: "542414051699",
  appId: "1:542414051699:web:043b564a6117971ac88d06"
}
  

firebase=pyrebase.initialize_app(config)

dt=datetime.now()
tz = pytz.timezone('Asia/Kolkata')
now = dt.astimezone(tz)
day=now.strftime("%m-%d-%Y")
time=now.strftime("%H:%M:%S")

path_to_cloud="Logs/"

#to get the url of the storage image
#public_url=storage.child(path_to_cloud).get_url(None)

db=firebase.database()

data_to_upload = {
    "inUrl": "yashvi",
}

add='videobase-dynamic-auth-system/Logs/'+day+'#phone number here/'
db.child(path_to_cloud).set(data_to_upload)
