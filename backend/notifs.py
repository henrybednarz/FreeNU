import smtplib

import smtplib
import sqlite3
from email.message import EmailMessage
from email.mime.text import MIMEText
from collections import defaultdict


def loadServer():
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login("freenortheastern", "ltfq fjln jytd yuyv")
    return server

class FreeNUEmailer:
    def __init__(self):
        self.db_file = "events.db"
        self.mailServer = smtplib.SMTP('smtp.gmail.com', 587)
        self.address = "freenortheastern@gmail.com"

    def massSend(self, event):
        self.mailServer.starttls()
        self.mailServer.login("freenortheastern", "ltfq fjln jytd yuyv")

        with sqlite3.connect(self.db_file) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
            users = [
                {"email": row[0], "id": row[1]}
                for row in cursor.fetchall()
            ]
            print(users)
            for userObj in users:
                id = userObj["id"]
                email = userObj["email"]
                message = self.generate_event_email(event, id)
                self.sendMessage(message, email)
        self.mailServer.quit()

    def generate_event_email(self, event, userID):
        msg = EmailMessage()
        msg["Subject"] = f"FreeNU: {event["title"]} at {event["location"]}!"
        msg["From"] = self.address 

        with open('/Users/henry/Desktop/FreeNU/FreeNU/backend/emailTemplate.txt', 'r') as file:
            html_template = file.read()

        bodyText = html_template.format(            
            event_name = event["title"],
            event_description = event["description"],
            event_end_time = event["end time"],
            event_location = event["location"],
            user_id = userID)

        htmlBody = MIMEText(bodyText, 'html')
        msg.set_content(htmlBody)
        return msg

    def sendMessage(self, message, recipient):
        try:
        # Convert event to message
            del message["TO"]
            message["TO"] = recipient
            self.mailServer.send_message(message)
        except SMTPException:
            print(f"Problem with SMTP Server, could not send {message["Subject"]} message to {recipient}")