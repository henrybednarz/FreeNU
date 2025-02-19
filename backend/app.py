from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import json
import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
import threading

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://neondb_owner:H1NBVm2YEqWa@ep-patient-paper-a5dua3c8-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
db = SQLAlchemy(app)

CORS(app)
# m
EVENT_TYPES = ['drinks', 'food', 'merchandise', 'other']
email_queue = []

class Event(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  active = db.Column(db.Boolean, default=True)
  createdAt = db.Column(db.DateTime, default=datetime.now())
  title = db.Column(db.String(100), nullable=False)
  description = db.Column(db.Text)
  type = db.Column(db.String(20))
  lat = db.Column(db.Float, nullable=False)
  lng = db.Column(db.Float, nullable=False)
  lastSeen = db.Column(db.DateTime, default=datetime.now())

class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(120), unique=True, nullable=False)


@app.before_request
def handle_preflight():
  if request.method == "OPTIONS":
    res = Response()
    res.headers['X-Content-Type-Options'] = '*'
    # res.headers['Access-Control-Allow-Origin'] = '*'
    return res

def deactivate_old_events():
    while True:
        with app.app_context():  # Ensure this runs within the Flask app context
            cutoff_time = datetime.now() - timedelta(hours=4)
            outdated_events = Event.query.filter(Event.lastSeen < cutoff_time, Event.active == True).all()
            for event in outdated_events:
                event.active = False
            db.session.commit()
        time.sleep(3600)

def load_events():
  events = Event.query.filter_by(active=True)
  # Check events for deletion (lazy) or make scheduler to remove them 
  events = [
    {
      "id": e.id,
      "title": e.title,
      "description": e.title,
      "type": e.type,
      "lng": e.lng,
      "lat": e.lat,
      "createdAt": e.createdAt,
      "lastSeen": e.lastSeen,
      "active": e.active
    }
    for e in events]
  return events

def load_users():
  users = User.query.all()
  return ([
        { "id": u.id,
          "email": u.email,}
    for u in users])

def delete_user(user_id):
  try:
    user = User.query.filter_by(id=user_id).delete()
    db.session.commit()
    return jsonify(user)
  except:
    db.session.rollback()
    return None

def updateLastSeen(id):
  event = Event.query.filter_by(id=id, active=True).first()
  if not event:
    return None
  try:
    event.lastSeen = datetime.now()
    db.session.commit()
    return event
  except:
    db.session.rollback()
    return None

def deactivate(id):
  event = Event.query.filter_by(id=id, active=True).first()
  if not event:
    return None
  try:
    event.active = False
    db.session.commit()
    return event
  except:
    db.session.rollback()
    return None
    

def add_event(data: dict):
  try:
    new_event = Event(
      title=data["title"],
      description=data["description"],
      type=data["type"],
      lat=data["lat"],
      lng=data["lng"],
      createdAt=datetime.now(),
      lastSeen=datetime.now(),
      active=True  # Default to active
    )
    db.session.add(new_event)
    db.session.commit()
    return new_event  # Return the newly created event for reference
  except IntegrityError:
    db.session.rollback()
    return None

def add_user(data: dict):
  try:
    new_user = User(
      email=data["email"]
    )
    print(data)
    db.session.add(new_user)
    db.session.commit()
    return new_user
  except IntegrityError:
    db.session.rollback()
    return None

@app.route('/api/events', methods=['GET', 'OPTIONS'])
def get_events():
  active_events = load_events()
  return jsonify(active_events)

@app.route('/api/submit', methods=['POST', 'OPTIONS'])
def submit_event():
  new_event = request.json
  # VALIDATE
  # if (!valid): return 400
  r = add_event(new_event)
  if r:
    return jsonify(new_event), 200
  else:
    return "fail", 400

@app.route('/api/sighting/<int:event_id>', methods=['POST', 'OPTIONS'])
def update_event(event_id):
  resp = request.json
  if resp["remove"]:
      event = deactivate(event_id)
  elif resp["lastSeen"]:
      event = updateLastSeen(event_id)
      
  if event:
      return "success", 200
  else:
      return "fail", 400

@app.route('/api/event-types', methods=['GET', 'OPTIONS'])
def get_event_types():
  return jsonify(EVENT_TYPES)

@app.route('/api/users', methods=['GET', 'OPTIONS'])
def get_users():
  users = load_users()
  return users, 200

@app.route('/api/subscribe/', methods=['POST', 'OPTIONS'])
def addUser():
  data = request.json
  r = add_user(data)
  print(r)
  if r:
    return "success", 200
  else:
    return "fail", 400

@app.route('/api/unsubscribe/<int:user_id>', methods=['POST', 'OPTIONS'])
def removeUser(id):
  x = delete_user(id)
  if x:
    return "success", 200
  else:
    return "fail", 400

if __name__ == '__main__':
    threading.Thread(target=deactivate_old_events, daemon=True).start()
    port = int(os.getenv("PORT", 5003))  # Use PORT from environment variables
    app.run(host="0.0.0.0", port=port)