import time
import json
import requests
from participant import *
from route import *

def postPosition(url,token,position):

    headers = {u'content-type':u'application/json',
               u'Authorization':token
               }
    
    payload = {
        "coordinates":{
            "lat":position[0],
            "lng":position[1]
        }
    }

    r = requests.post(url,json = payload,headers = headers)

    print(r.json())

def simulate(url,eventId,competitors,r):

    url = url +"/api/events/" + eventId + "/participants/positions"
    finishedCompetitors = []

    for competitor in competitors:
        startingPosition = r.getStartingPoint()
        competitor.setPosition(startingPosition[0],startingPosition[1])
        #set position
        postPosition(url,competitor.token,startingPosition)

    while (len(competitors) > len(finishedCompetitors)):

        for competitor in competitors:

            if (competitor.finished == True):
                continue
            
            else:
                checkpoint = competitor.getCurrentCheckpoint()
                vector = r.calculateVector(checkpoint)
                competitor.updatePosition(vector[0],vector[1])
                currentPosition = competitor.getCurrentPosition()

                #set position
                postPosition(url,competitor.token,currentPosition)
                
                print ("Name\t:" + competitor.name + " " + competitor.surname + "\nPosition : " + str(currentPosition) + "\n")
                checkpointReached = r.setCheckpoint (checkpoint,currentPosition)

                if (checkpointReached == True):
                    print ("Checkpoint reached")
                    checkpoint += 1

                    if (checkpoint >= r.getLastCheckpoint()):
                        competitor.finished = True
                        finishedCompetitors.append(competitor)

                    #reposition competitor to checkpoint
                    coordinate = r.getCoordinate(checkpoint)
                    competitor.setPosition(coordinate[0],coordinate[1])
                    competitor.setCheckpoint(checkpoint)
                #sleep before each post request
                time.sleep(0.005)
        #step simulation
        time.sleep(2)

    print ("All users finished")