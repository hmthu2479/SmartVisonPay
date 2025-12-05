from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
model = YOLO("yolov8_model/yolov8s.pt")  
print("YOLO classes:", model.names)

# Map class names từ YOLO sang tên DB
CLASS_TO_DB = {
    "HaoHaoBig100": "Mì gói Hảo Hảo Big 100",
    "HaoHaoXao": "Mì gói xào Hảo Hảo",
    "PepsiLon320ml": "Pepsi lon 320ml",
    "CocaLon320ml": "Coca lon 320ml",
    "FamiBichNguyenChat200ml": "Sữa Fami nguyên chất bịch 200ml",
    "CocaChai390ml": "Coca chai 390ml"
}

CONF_THRESHOLD = 0.7   # yêu cầu confidence tối thiểu 70%

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        img_b64 = data.get("image")
        if not img_b64:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 -> numpy array
        img_bytes = base64.b64decode(img_b64.split(",")[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Predict
        results = model.predict(img)

        products = []

        for result in results:
            boxes = result.boxes

            for cls_id, conf in zip(boxes.cls.tolist(), boxes.conf.tolist()):
                if conf < CONF_THRESHOLD:
                    continue  # bỏ qua dự đoán confidence thấp

                class_name = model.names[int(cls_id)]
                db_name = CLASS_TO_DB.get(class_name, class_name)
                products.append(db_name)

        return jsonify({"products": products})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False, use_reloader=False)
