# -*- coding: utf-8 -*-
"""
Created on Wed Jan 29 19:16:52 2020

@author: Poojan
"""

import cv2
import pyrebase
from datetime import datetime
import pytz



user_id = input("Enter user id:")

"""firebaseConfig = {
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


user_id = db.child("registered").get()
print(user_id.val())
user_id = str(len(user_id.val()))
print(user_id)
path_to_cloud="registered/" + user_id

user_name = input("Enter user name:")



data_to_upload = {
    "Name": user_name,
    "Status":1
}"""

#db.child(path_to_cloud).set(data_to_upload)

def generate_dataset(img, id, img_id):
    cv2.imwrite("D:/ML project/data/" + str(id)+"."+str(img_id)+".jpg",img)

def show_webcam(mirror=False):
    #clf = cv2.face.LBPHFaceRecognizer_create()
    #clf.read("D:/ML project/classifier.xml")
    cam = cv2.VideoCapture(0)
    img_id=1
    while True:
       
        ret_val, img = cam.read()
        #cv2.imshow("image",img)
        #img = detect(img,faceCascade,img_id)1
        img = detect(img,faceCascade,img_id)
        if mirror: 
            img = cv2.flip(img, 1)
        cv2.imshow('my webcam', img)
        img_id += 1
        if cv2.waitKey(1) == 27: 
            break  # esc to quit
    cv2.destroyAllWindows()


def draw_boundary(img, classifier, scaleFactor, minNeighbour, color, text):
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    features = classifier.detectMultiScale(gray_img, scaleFactor, minNeighbour)
    coords = []
    for (x,y,w,h) in features:
        cv2.rectangle(img,(x,y), (x+w,y+h),color,2)
        cv2.putText(img, user_id, (x,y-4),cv2.FONT_HERSHEY_SIMPLEX,0.8,color,1,cv2.LINE_AA)
        coords = [x,y,w,h]
    return coords,img

def detect(img,faceCascade,img_id):
    color = {"blue":(255,0,0), "red":(0,0,255), "green":(0,255,0)}
    coords,img = draw_boundary(img,faceCascade,1.2,14,color['blue'],"face")
    if len(coords) == 4:
        roi_img = img[coords[1]:coords[1]+coords[3], coords[0]:coords[0]+coords[2]]
        generate_dataset(roi_img, user_id, img_id)
        
    return img

faceCascade = cv2.CascadeClassifier('D:/ML project/Face-Detection-Recognition-Using-OpenCV-in-Python-master/haarcascade_frontalface_default.xml')

def main():
    show_webcam(mirror=True)


if __name__ == '__main__':
    main()