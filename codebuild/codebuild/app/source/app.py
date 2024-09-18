#Zachary Job
#05/13/23
#app.py
#
#A very simple demo API

from flask import Flask
from flask import request, jsonify

app = Flask(__name__)


@app.errorhandler(ConnectionError)
def connection_error(e):
    app.logger.error("connection error: %s", e)
    return "Connection Error", 500


@app.route("/")
def hello():
    return "Hello!"


@app.route("/goaway", methods=["GET"])
def easter_egg():
    return "Go!" 


@app.get("/reflect")
def reflect():
    return jsonify({"headers": dict(request.headers)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
