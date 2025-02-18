import smtplib

import smtplib
import sqlite3
from email.message import EmailMessage
from email.mime.text import MIMEText
from collections import defaultdict

typeEmojis = {
    "drinks": 1,
    "food": 2,
    "merchandise": 3,
    "other": 4
}

def loadServer():
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login("freenortheastern", "ltfq fjln jytd yuyv")
    return server
    # Make sure to server.quit()


def genEmailTemplate(event):
    msg = EmailMessage()
    msg['Subject'] = "free event"
    msg['From'] = 'freenortheastern@gmail.com'

    with open('../notifications/template.html', 'r') as infile:
        htmlString = infile.read()
    infile.close()

    bodyText = htmlString.format(            
        event = event["title"],
        description = event["description"],
        eventType = event["type"]
    )

    htmlText = MIMEText(bodyText, 'html')
    msg.set_content(htmlText)
    return msg


def sendMail(emailTemplate, toAddresses, server):
    server = loadServer()
    for addr in toAddresses:
        server.sendMail('freenortheastern@gmail.com', addr, emailTemplate)
    server.quit()