import pyrebase
from datetime import datetime as dt
import pytz
import firebase
import boto3
import sys
#from google.cloud import storage
import dlib
import cv2
import numpy as np
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto import Random
import os
import time

Config = {
  "apiKey": "AIzaSyBplgfDMaVZSDahuI2RwF24a7e2K4vVXcs",
  "authDomain": "videobase-dynamic-auth-system.firebaseapp.com",
 "databaseURL": "https://videobase-dynamic-auth-system.firebaseio.com",
  "projectId": "videobase-dynamic-auth-system",
  "storageBucket": "videobase-dynamic-auth-system.appspot.com",
  "messagingSenderId": "542414051699",
  "appId": "1:542414051699:web:043b564a6117971ac88d06"
}

# First let us encrypt secret message
BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]
 
password = "0A1B2C3D4E5F6A7B8C9D0E1F2A3B3C4D"
 
def decrypt(enc):
    res = []

    for i in enc:
        i = str(i)
        private_key = hashlib.sha256(password.encode("utf-8")).digest()
        if len(i)!=64:
            return np.zeros(128).tolist()
        i = base64.b64decode(i)
        iv = i[:16]
        cipher = AES.new(private_key, AES.MODE_CBC, iv)
        res.append(float(unpad(cipher.decrypt(i[16:])).decode()))
    return res

tz = pytz.timezone('Asia/Kolkata')

weights = 'MODELS/mmod_human_face_detector.dat'
# initializing cnn face detector model
cnn_face_detector = dlib.cnn_face_detection_model_v1(weights)
# Get Face Detector from dlib
# This allows us to detect faces in images
# face_detector = dlib.get_frontal_face_detector()
face_recognition_model = dlib.face_recognition_model_v1('MODELS/dlib_face_recognition_resnet_model_v1.dat')
# Get Pose Predictor from dlib
# This allows us to detect landmark points in faces and understand the pose/angle of the face
shape_predictor = dlib.shape_predictor('MODELS/shape_predictor_68_face_landmarks.dat')
TOLERANCE = 0.50


def rect_to_bb(face):
    # take a bounding predicted by dlib and convert it
    # to the format (x, y, w, h) as we would normally do
    # with OpenCV
    x = face.rect.left()
    y = face.rect.top()
    w = face.rect.right() - x
    h = face.rect.bottom() - y
    return (x, y, w, h)

known_face_ids = []
known_face_names = []
known_face_encodings = []
def get_face_encodings(path_to_image):
    # Load image using scipy
    # print(path_to_image)
    image = cv2.imread(path_to_image)
    # Detect faces using the face detector
    # detected_faces = face_detector(image, 1)
    res = cnn_face_detector(image,1)
    # detected_faces.rect = detected_faces
    shapes_faces = []
    for r in res:
        face = r.rect
        # print(face)
        # Get pose/landmarks of those faces
        # Will be used as an input to the function that computes face encodings
        # This allows the neural network to be able to produce similar numbers for faces of the same people, regardless of camera angle and/or face positioning in the image
        shapes_faces.append(shape_predictor(image, face))
    
    # For every face detected, compute the face encodings
    return [np.array(face_recognition_model.compute_face_descriptor(image, face_pose, 1)) for face_pose in shapes_faces]
def get_vid_encodings(v_image,face):
    # print(face)
    # detected_faces = face_detector(v_image, 1)
    # Get pose/landmarks of those faces
    # Will be used as an input to the function that computes face encodings
    # This allows the neural network to be able to produce similar numbers for faces of the same people, regardless of camera angle and/or face positioning in the image
    shapes_faces = shape_predictor(v_image, face)
    # For every face detected, compute the face encodings
    # return [encrypt(np.array(face_recognition_model.compute_face_descriptor(v_image, shapes_faces, 1)))]
    return [np.array(face_recognition_model.compute_face_descriptor(v_image, shapes_faces, 1))]

def compare_face_encodings(known_faces, face):
    # Finds the difference between each known face and the given face (that we are comparing)
    # Calculate norm for the differences with each known face
    # Return an array with True/Face values based on whether or not a known face matched with the given face
    # A match occurs when the (norm) difference between a known face and the given face is less than or equal to the TOLERANCE value
    return (np.linalg.norm(known_faces - face,axis=1) <= TOLERANCE)

def draw_border(img, pt1, pt2, color, thickness, r, d):
    x1,y1 = pt1
    x2,y2 = pt2
 
    # Top left
    img = cv2.line(img, (x1 + r, y1), (x1 + r + d, y1), color, thickness)
    img = cv2.line(img, (x1, y1 + r), (x1, y1 + r + d), color, thickness)
    img = cv2.ellipse(img, (x1 + r, y1 + r), (r, r), 180, 0, 90, color, thickness)
 
    # Top right
    img = cv2.line(img, (x2 - r, y1), (x2 - r - d, y1), color, thickness)
    img = cv2.line(img, (x2, y1 + r), (x2, y1 + r + d), color, thickness)
    img = cv2.ellipse(img, (x2 - r, y1 + r), (r, r), 270, 0, 90, color, thickness)
 
    # Bottom left
    img = cv2.line(img, (x1 + r, y2), (x1 + r + d, y2), color, thickness)
    img = cv2.line(img, (x1, y2 - r), (x1, y2 - r - d), color, thickness)
    img = cv2.ellipse(img, (x1 + r, y2 - r), (r, r), 90, 0, 90, color, thickness)
 
    # Bottom right
    img = cv2.line(img, (x2 - r, y2), (x2 - r - d, y2), color, thickness)
    img = cv2.line(img, (x2, y2 - r), (x2, y2 - r - d), color, thickness)
    img = cv2.ellipse(img, (x2 - r, y2 - r), (r, r), 0, 0, 90, color, thickness)
    return img

# This function returns the name of the person whose image matches with the given face (or 'Not Found')
# known_faces is a list of face encodings
# names is a list of the names of people (in the same order as the face encodings - to match the name with an encoding)
# face is the face we are looking for
def find_match(known_faces, face):
    # Call compare_face_encodings to get a list of True/False values indicating whether or not there's a match
    matches = compare_face_encodings(known_faces, face).tolist()
    # Return the name of the first match
    
    if True in matches:
        count = matches.index(True)
        print("Match Found ->",known_face_names[count])
        return count
    else:
        print('Not Found')
        return -1

# connect to the firebase database
firebase=pyrebase.initialize_app(Config)
db=firebase.database()
# fetch all the encodings, names,
known_faces=db.child("RegisteredPerson/").get()
#known_faces=db.child("TempRegistered/").get()
key=known_faces.val()

for phone in key:
    path="RegisteredPerson/"+phone+"/name/"
    #path="TempRegistered/"+phone+"/name/"
    name=db.child(path).get()
    #path="TempRegistered/"+phone+"/encoding/"
    path="RegisteredPerson/"+phone+"/encoding/"
    obj=db.child(path).get()
    size=len(obj.val())
    for index in range(size):
        #path="TempRegistered/"+phone+"/encoding/"+str(index)
        path="RegisteredPerson/"+phone+"/encoding/"+str(index)
        encodings=db.child(path).get()
        match=np.asarray(decrypt(encodings.val()))
        
        known_face_ids.append(phone)
        known_face_names.append(name.val())
        known_face_encodings.append(match)

def isRegistered_Out(face_encoding_in_image,public_url):
    
    tz = pytz.timezone('Asia/Kolkata')
    match=find_match(known_face_encodings,face_encoding_in_image)
    #now = dt.now(tz=tz)
    #d_string = now.strftime("%Y-%d-%m")
    #t_string = now.strftime("%H:%M:%S")
    #path = "Logs/"+phone+"/"+d_string+"/"
    #hasRecord = db.child(path).get()
    now = dt.now(tz=tz)
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    dt_date = now.strftime("%Y-%d-%m")
    dt_time = now.strftime("%H:%M:%S")
    if match != -1:
      path = "Logs/"+dt_date +"/" + known_face_ids[match]+"/"
      hasRecord = db.child(path).get()
      if hasRecord.val() != None:
        count = len(hasRecord.val())
        test = hasRecord.val()[count-1]["OutURL"]
        intime = hasRecord.val()[count-1]["Intime"]
      else:
        count = 0
        test = None
      #path = path +"/"+ str(count-1) + "/"
      #test = db.child(path + "Out-Time").get()
      print(hasRecord.val())
      
        
      if test == "URL":
        data_to_upload = {
          "Outtime":dt_time,
          "OutURL":public_url
        }
        add='Logs/'+dt_date + '/' + known_face_ids[match] +'/' + str(count-1)
        db.child(add).update(data_to_upload)
        db.child("Logs").update({"logsFlag": known_face_ids[match]})
      else:
        print("Already Entered")
      


def isRegistered_In(face_encoding_in_image,public_url):
    
    tz = pytz.timezone('Asia/Kolkata')
    match=find_match(known_face_encodings,face_encoding_in_image)
    #now = dt.now(tz=tz)
    #d_string = now.strftime("%Y-%d-%m")
    #t_string = now.strftime("%H:%M:%S")
    #path = "Logs/"+phone+"/"+d_string+"/"
    #hasRecord = db.child(path).get()
    now = dt.now(tz=tz)
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    dt_date = now.strftime("%Y-%d-%m")
    dt_time = now.strftime("%H:%M:%S")
    if match != -1:
      path = "Logs/"+dt_date +"/" + known_face_ids[match]+"/"
      hasRecord = db.child(path).get()
      if hasRecord.val() != None:
        count = len(hasRecord.val())
        test = hasRecord.val()[count-1]["Outtime"]
        print("test value: ",test)
      else:
        count = 0
        test = None
      #path = path +"/"+ str(count-1) + "/"
      #test = db.child(path + "Out-Time").get()
      print(hasRecord.val())
      
      data_to_upload = {
          "Intime":dt_time,
          "InURL":public_url,
          "Outtime":"00:00",
          "OutURL":"URL"
        }

      if test == None:
        add='Logs/'+dt_date + '/' + known_face_ids[match] +'/' + str(count)
        db.child(add).set(data_to_upload)
        db.child("Logs").update({"logsFlag": known_face_ids[match]})
      else:
        if test!="00:00":
            add='Logs/'+dt_date + '/' + known_face_ids[match] +'/' + str(count)
            db.child(add).set(data_to_upload)
            db.child("Logs").update({"logsFlag": known_face_ids[match]})
        else:
            print("Already Entered")
    else:
      path = "NotRegistered/"+dt_date +"/" 
      hasRecord = db.child(path).get()
      
      if hasRecord.val() == None:
        count = 0
      else:
        count = len(hasRecord.val())
      data_to_upload = {
          "Intime":dt_time,
          "InURL":public_url
      }
      add = "NotRegistered/"+dt_date +"/" +str(count)
      db.child(add).set(data_to_upload)

count = 0
suc=True
hls_stream_ARN = "arn:aws:kinesisvideo:ap-south-1:467495215989:stream/security/1584555696894"

STREAM_NAME = "security"
kvs = boto3.client("kinesisvideo")

print("Attempting to get an HLS streaming URL from AWS GetDataEndpoint API...")

# Grab the endpoint fVeryFirstrom GetDataEndpoint
endpoint = kvs.get_data_endpoint(
    APIName="GET_HLS_STREAMING_SESSION_URL",
    StreamARN="arn:aws:kinesisvideo:ap-south-1:467495215989:stream/security/1584555696894"

)['DataEndpoint']
# Grab the HLS Stream URL from the endpoint
kvam = boto3.client("kinesis-video-archived-media", endpoint_url=endpoint)
url = kvam.get_hls_streaming_session_url(
    StreamName=STREAM_NAME,
    PlaybackMode="LIVE"
)['HLSStreamingSessionURL']

print("HLS URL:", url)
VIDEO_URL = url

cap = cv2.VideoCapture(VIDEO_URL)
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))
frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
FPS = cap.get(cv2.CAP_PROP_FPS)
fourcc = cv2.VideoWriter_fourcc(*'XVID')
# out = cv2.VideoWriter('output.avi',fourcc, 20.0, (640,480))
# out = cv2.VideoWriter('outpy.avi',cv2.VideoWriter_fourcc('M','J','P','G'), 10, (frame_width,frame_height))
out = cv2.VideoWriter('outpy.avi',fourcc, 20, (frame_width,frame_height))

# set time zone
tz = pytz.timezone("Asia/Calcutta")
print("Video Capture Started")
start = time.time()
stream=0
skip = 0;
while suc:
    #Read the frame
    for t in range(skip):
        cap.grab()
    suc, img = cap.read()

    if suc == False:
        print('False')
        break
    else:
        # rotate stream by 270 deg
        img = np.rot90(img,3,(0,1))
        imgframe = img.copy()
        # detect faces in the image
        result_list = cnn_face_detector(img, 1)
        # display faces on the original image
        # plot each face as a subplot
        org = (30, 30)
        # font 
        font = cv2.FONT_HERSHEY_SIMPLEX 
        # fontScale 
        fontScale = 0.6
        # White color in BGR 
        color = (255, 255, 255) 
        # Line thickness of 2 px 
        thickness = 1
        
        # get current date and time
        # now = dt.now(tz=tz) 
        # dd/mm/YY H:M:S
        # dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
        # d_string = now.strftime("%d/%m/%Y")
        # t_string = now.strftime("%H:%M:%S")
                    
        # framestamp = 'Frame{}'.format(count) + ' ' + dt_string

        # Using cv2.putText() method
        # imgframe = cv2.putText(imgframe, framestamp, org, font,fontScale, color, thickness, cv2.LINE_AA)
        flag = 0 
        now = dt.now(tz=tz)
        dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
        dt_date = now.strftime("%Y-%d-%m")
        storage = firebase.storage()
        for i in range(len(result_list)):
            
            if flag==0:
              cv2.imwrite("Image.jpg",img)
              path_to_cloud="Logs/"+str(now.timestamp())+".jpg"
              #to upload the image in storage
              public_url=storage.child(path_to_cloud).put("Image.jpg")
              public_url=storage.child(path_to_cloud).get_url(None)
              flag=1
            
            # get coordinates
            x1, y1, width, height = rect_to_bb(result_list[i])
            x2, y2 = x1 + width, y1 + height
            image = img[y1-40:y2+40, x1-40:x2+40]
            res = result_list[i].rect
            face_encodings_in_image = get_vid_encodings(img,res)
            if len(face_encodings_in_image) != 1:
                print("Please change image: - it has " + str(len(face_encodings_in_image)) + " faces; it can only have one")
                # continue
            else:
                # Find match for the face encoding
                print("{} : This is".format(count),end="")
                if stream==1:
                    isRegistered_In(face_encodings_in_image[0],public_url)
                if stream==0:
                    isRegistered_Out(face_encodings_in_image[0],public_url)
        count = count + 1

end = time.time()
print("Recognition time: {}".format(end - start))
print("Total Frames: ",frames)
print("FPS: ",FPS)
print("Skip: ",skip)
print("Total Frames Processed: ",count)
cap.release()
out.release()
cv2.destroyAllWindows()
print('Done')