from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Load class names and model
class_names = [line.strip() for line in open('coco_classes.txt')]

# Load the SavedModel using tf.saved_model.load
model = tf.saved_model.load("ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8/saved_model")

# Define a Keras model that wraps the SavedModel
class SSDMobileNetModel(tf.keras.Model):
    def __init__(self, saved_model):
        super(SSDMobileNetModel, self).__init__()
        self.saved_model = saved_model

    def call(self, inputs):
        outputs = self.saved_model.signatures["serving_default"](inputs)
        return outputs

# Create an instance of the Keras model
model = SSDMobileNetModel(model)

# Define the detect object function
def detect_object(image_url):
    try:
        # Load and preprocess the image
        img_response = requests.get(image_url)
        img_array = np.asarray(bytearray(img_response.content), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        img = tf.image.resize(img, (320, 320))
        img = tf.cast(img, tf.uint8)  # Cast to uint8
        img = img[tf.newaxis, ...]

        # Run inference
        detections = model(img)

        detection_boxes = detections['detection_boxes'][0].numpy()
        detection_classes = detections['detection_classes'][0].numpy().astype(np.int32)
        detection_scores = detections['detection_scores'][0].numpy()

        threshold = 0.5
        results = []
        for i in range(len(detection_scores)):
            if detection_scores[i] >= threshold:
                # box = detection_boxes[i].tolist()
                class_name = int(detection_classes[i])
                # score = float(detection_scores[i])
                results.append({
                    # 'box': box,
                    # 'class': class_name
                    'class_name': class_names[class_name]
                    # 'score': score
                })
        return results
    except Exception as e:
        return str(e)

# Define the detect route
@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        image_url = data['image_url']
        detections = detect_object(image_url)
        return jsonify(detections)

   
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run()