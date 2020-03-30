import os
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
import datetime
import pyrebase
import json
import numpy as np
import cv2 as cv2
from datetime import date
# Create your views here.
config = {
    'apiKey': "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
    'authDomain': "videobase-dynamic-auth-system.firebaseapp.com",
    'databaseURL': "https://videobase-dynamic-auth-system.firebaseio.com",
    'projectId': "videobase-dynamic-auth-system",
    'storageBucket': "videobase-dynamic-auth-system.appspot.com",
    'messagingSenderId': "542414051699",
    'appId': "1:542414051699:web:4625898e615fba4dc88d06"
}

firebase = pyrebase.initialize_app(config)
db = firebase.database()
storage = firebase.storage()
auth = firebase.auth()
authToken = ""
uname = ""

flag = 0

def dateChanged(request): 
    #authToken = auth.current_user.get('localId')
    if request.method == 'POST':
        mno = request.POST['mno']
        duration = request.POST['duration']
        splittedNew = duration.split('-')
        curr_date = str(date.today()).split('-')
        splittedCurrDate = curr_date
        print(curr_date)
        if splittedCurrDate[0] == splittedNew[0]:
            if splittedCurrDate[1] == splittedNew[1]:
                if splittedCurrDate[2] < splittedNew[2]:
                    db.child('RegisteredPerson').child(mno).child('ExpiryDate').set(splittedNew[0]+"-"+splittedNew[2]+"-"+splittedNew[1])
                    return HttpResponse("True")
            elif splittedCurrDate[1] < splittedNew[1]:
                db.child('RegisteredPerson').child(mno).child('ExpiryDate').set(splittedNew[0]+"-"+splittedNew[2]+"-"+splittedNew[1])
                return HttpResponse("True")
        elif splittedCurrDate[0] < splittedNew[0]:
            db.child('RegisteredPerson').child(mno).child('ExpiryDate').set(splittedNew[0]+"-"+splittedNew[2]+"-"+splittedNew[1])
            return HttpResponse("True")
            
    return HttpResponse("False")

def signIn(request):
    return render(request, "signIn.html")


def index(request):
    return render(request, "index.html")


def homePage(request):
    if authToken != "":
        return render(request, "screen.html")
    else:
        messages.info(request, 'Please SignIn')
        return render(request, 'signIn.html')


def postsign(request):
    global flag
    if flag == 0:
        global uname
        uname = request.POST['email']
        passw = request.POST['pass']
        global authToken
        print(uname)
        # db.child('users').child(uname).set(data)
        # i = db.child('image').child('img').get()
        # i = "https://firebasestorage.googleapis.com/v0/b/security-sgp.appspot.com/o/images%2Fdemo.jpg?alt=media&token=b887b2c7-a21e-4a64-a20d-043515578392"
        try:
            user = auth.sign_in_with_email_and_password(uname, passw)
            print(user)
            flag = 1
            authToken = auth.current_user.get('localId')
        except:
            messages.info(request, 'Invalid Credentials')
            return render(request, 'signIn.html')

        return render(request, "firstPage.html")
    elif authToken != "":
        return render(request, "firstPage.html")
    else:
        return redirect("/")

def logout(request):
    global authToken
    authToken = ""
    return render(request, "signIn.html")


def resetPassword(request):
    global authToken
    authToken = ""
    return render(request, "resetpassword.html")


def capture_img(request):
    print("capturing Image")
    key = request.POST['mno']
    cap = cv2.VideoCapture(0)
    #directory = r".\registeration images"
    #os.chdir(directory)
    i = 0
    while (i<10):
        # Capture frame-by-frame
        ret, frame = cap.read()
        i = i+1
        #print(frame)
        # Our operations on the frame come here
        filename = "./registration images/"+str(key) + "_" + str(i)+'.jpg'
        # writting the resulting frame
        cv2.imwrite(filename, frame)

    # When everything done, release the capture
    cv2.waitKey(0)
    cap.release()
    cv2.destroyAllWindows()
    #print("image is captured")
    return HttpResponse("<h1>Image Captured</h1>")

def addPerson(request):
    print("Called")
    if request.method == 'POST':
        name = request.POST['name']
        mno = request.POST['mno']
        designation = request.POST['designation']
        # pEmp = request.POST['pEmp']
        pEmp = False
        duration = request.POST['duration']
        # date = str(datetime.datetime.now())
        date = datetime.datetime.now().strftime("%m/%d/%Y %H:%M:%S")
        #if pEmp == False:
        #     # permanent employee
        #     data = {
        #         'name': name,
        #         'Contact No': mno,
        #         'Occupation': designation,
        #         'RegisteredBy': uname,
        #         'RegisteredOn': date,
        #         'ExpiryDate': 'NA',
        #         'status': -1
        #     }
        # else:
            # temporary employee
        #print("Hello")
        url = []
        i = 0
        while (i < 10):
	        i = i+1
	        path_to_cloud = "Known_faces/"+str(mno)+"_" + str(i)+".jpg"
	        imgFile = "./registration images/" + str(mno) + "_" + str(i) + ".jpg"
	        #print(imgFile)
	        public_url = storage.child(path_to_cloud).put(imgFile)
	        public_url = storage.child(path_to_cloud).get_url(None)
	        url.append(public_url)
	        os.remove(imgFile)
        data = {
            'name': name,
            'Contact No': mno,
            'Designation': designation,
            'RegisteredBy': uname,
            'RegisteredOn': date,
            'ExpiryDate': duration,
            'status': 1,
            'url' : url
        }
        db.child('RegisteredPerson').child(mno).set(data)
        data = {
            'key' : mno
        }
        db.child('Updated').set(data)
    return HttpResponse("<h1>form submitted</h1>")


def logsOf(request):

    if authToken != "":
        return render(request, 'logsOf.html')
    else:
        return redirect("/")

def unregistered(request):
    if authToken != "":
        return render(request, 'unregistered.html')
    else:
        return redirect("/")
