from flask import Flask, send_from_directory
import os

app = Flask(__name__)
ROOT = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    return send_from_directory(ROOT, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(ROOT, filename)

if __name__ == '__main__':
    app.run(port=8765)
