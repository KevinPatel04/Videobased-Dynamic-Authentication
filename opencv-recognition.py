import cv2
import pyrebase
from datetime import datetime
import pytz
from google.cloud import storage


firebaseConfig = {
  "apiKey": "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
  "authDomain": "videobase-dynamic-auth-system.firebaseapp.com",
  "databaseURL": "https://videobase-dynamic-auth-system.firebaseio.com",
  "projectId": "videobase-dynamic-auth-system",
  "storageBucket": "videobase-dynamic-auth-system.appspot.com",
  "messagingSenderId": "542414051699",
  "appId": "1:542414051699:web:043b564a6117971ac88d06"
}

firebase=pyrebase.initialize_app(firebaseConfig)
db=firebase.database()
store=firebase.storage()

#date
dt=datetime.now()
tz = pytz.timezone('Asia/Kolkata')
now = dt.astimezone(tz)
day=now.strftime("%m-%d-%Y")
time=now.strftime("%H:%M:%S")

#storage
clf = cv2.face.LBPHFaceRecognizer_create()
clf.read("D:/ML project/classifier.xml")

def generate_dataset(img, id, img_id):
    cv2.imwrite("D:/ML project/data/user." + str(id)+"."+str(img_id)+".jpg",img)

def show_webcam(mirror=False):
    cam = cv2.VideoCapture(0)
    img_id = 0
    while True:
       
        ret_val, img = cam.read()
        #cv2.imshow("image",img)
        img = recognize(img,clf,faceCascade)
        if mirror: 
            img = cv2.flip(img, 1)
        cv2.imshow('my webcam', img)
        img_id +=1
        if cv2.waitKey(1) == 27: 
            break  # esc to quit
    cv2.destroyAllWindows()

def draw_boundary(img, classifier, scaleFactor, minNeighbour, color, text,clf):
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    features = classifier.detectMultiScale(gray_img, scaleFactor, minNeighbour)
    coords = []
    for (x,y,w,h) in features:
        cv2.rectangle(img,(x,y), (x+w,y+h),color,2)
        id,conf = clf.predict(gray_img[y:y+h, x:x+w])
        #user=db.child("registered/"+str(id)+"/name").get()
        print(conf)
        print(id)
        cv2.putText(img, "ajsxn", (x,y-4),cv2.FONT_HERSHEY_SIMPLEX,0.8,color,1,cv2.LINE_AA)
        coords = [x,y,w,h]
    return coords,img


def recognize(img, clf, faceCascade):
    color = {"blue":(255,0,0), "red":(0,0,255), "green":(0,255,0)}
    coords,img = draw_boundary(img, faceCascade, 1.1, 15, color["green"],"face",clf)
    return img

def detect(img,faceCascade,img_id):
    color = {"blue":(255,0,0), "red":(0,0,255), "green":(0,255,0)}
    coords,img = draw_boundary(img,faceCascade,1.2,14,color['blue'],"face")
    
    if len(coords) == 4:
        
        roi_img = img[coords[1]:coords[1]+coords[3], coords[0]:coords[0]+coords[2]]
        print("poojan")
        user_id=1
        generate_dataset(roi_img, user_id, img_id)
        
    return img

faceCascade = cv2.CascadeClassifier('D:/ML project/Face-Detection-Recognition-Using-OpenCV-in-Python-master/haarcascade_frontalface_default.xml')

def main():
    show_webcam(mirror=False)


if __name__ == '__main__':
    main()