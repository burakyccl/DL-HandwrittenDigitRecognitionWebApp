import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from flask import Flask, request
import cv2
from flask_cors import CORS
import logging
from PIL import Image
import requests
from io import BytesIO
from base64 import decodestring
import base64
app = Flask(__name__)
CORS(app)

result = ''

@app.route('/')
def home_endpoint():
    return 'Hello World!'


@app.route('/predict', methods=["POST"])
def get_prediction():


    # url = request.data
    url = request.get_json()
    value = url.get('value', '')

    if value.startswith("data:image/png;base64,"):
        value = value[22:]

    imgdata = base64.b64decode(value)
    filename = 'test.png'  
    with open(filename, 'wb') as f:
        f.write(imgdata)

    loaded_model = load_model('my_model')
    img = cv2.imread('test.png')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (28,28),interpolation = cv2.INTER_AREA)
    newimg = tf.keras.utils.normalize (resized, axis = 1)
    newimg= np.array(newimg).reshape(-1, 28, 28, 1)
    predictions = loaded_model.predict(newimg)
    returnResult = np.argmax(predictions)

    logging.warning('**************************************************')
    logging.warning(str(returnResult))
    logging.warning('**************************************************')

    global result 
    result = str(returnResult)
    return 'Success'

@app.route('/result')
def get_result():
    logging.warning(result)
    return result

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=7000)