import {Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import { MapsAPILoader} from "@agm/core";
import { EventService } from '../../../shared/services/index';
import { } from '@types/googlemaps';
import { RouteService } from "../../../shared/services/route.service";
import { ActivatedRoute, Router } from "@angular/router";
import {Event} from '../../../shared/models/event';
import {User} from "../../../shared/models";

declare var $:any;
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  public initLat: number;
  public initLong: number;
  public zoom = 15;

  public mapPoints; //latLng array
  directions: any;

  private event= new Event();
  private eventId;
  private participantsList: any = [];
  private participantsMarkers : Progress[] = [];

  private refreshInterval;

  private participantSelection : Boolean = false;
  private selectedUser: Progress[]  = [];

  public marker_background_colors = ["green", "red", "yellow", "orange", "purple", "pink",
    "blue", "black", "gray", "white", "brown"];

  @ViewChild('searchType') searchType: ElementRef;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private routeService: RouteService,
              private router: Router, private eventService: EventService, private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.parent.params.subscribe(params => {
      this.eventId = params['eventId'];
      console.log('[Map][OnInit][EventId]', this.eventId);
    });

    this.eventService.getEvent(this.eventId)
      .then(
        (event) => {
          this.event = event;
          // check the status
          if(this.event.status === 'ongoing'){
            // retrieve the last position every 5 seconds
            this.refreshInterval = setInterval(
              ()=>{
                this.eventService.getLastPositions(this.eventId)
                  .then((participantsProgress) => {
                    console.log("[Progress Management][OnInit][GetLastPositions][Success]", participantsProgress);
                    this.transformParticipantsMaker(participantsProgress);
                  }).catch((error)=> {
                  console.log("[Progress Management][OnInit][GetLastPositions][Error]", error);
                  //TODO: Show errors
                })
              }, 5 * 1000);
            this.initParticipantList();
          }
        });
    this.routeService.getRoute(this.eventId)
      .then(
        (coordinates) => {
          console.log('[Progress Management][OnInit][success]', coordinates);
          console.log('[Progress Management][OnInit][Coordinates detected]', coordinates);
          this.mapPoints = coordinates;
          this.initMap();
        })
      .catch((error) => {
        console.log('[Progress Management][OnInit][error]', error);
      });
  }

  /**
   * Called after the page has been rendered.
   * It initializes some UI components.
   */
  ngAfterViewInit() {
    $('.selectpicker').selectpicker("render");
  }

  /**
   * It goes through the data received from the service and creates an array of markers.
   * @param participantsProgress
   */
  transformParticipantsMaker(participantsProgress){
    // clean the previous markers
    this.participantsMarkers = [];
      for (let i = 0; i < participantsProgress.length; i++) {
        this.participantsMarkers.push({
          lat: Number(participantsProgress[i].lastPosition.lat),
          lng: Number(participantsProgress[i].lastPosition.lng),
          timestamp: participantsProgress[i].timestamp,
          user: participantsProgress[i].userId,
          select: this.getParticipantSelection(participantsProgress[i].userId),
          icon: "http:// labs.google.com/ridefinder/images/mm_20_" +
          this.marker_background_colors[i % this.marker_background_colors.length] + ".png"
        });
    }
  }

  /**
   * if a user is selected then the array selectedUser contains the values of each user
   * @param {User} user
   * @returns {Boolean} if that user was previously selected or not
   */
  getParticipantSelection ( user: User): Boolean {
    if(this.selectedUser.length > 0){
      for(let sel of this.selectedUser){
        if(sel.user.id === user.id){
          return sel.select;
        }
      }
    }else {
      return true;
    }
}

  initParticipantList() {
    this.participantsList = [];
    if(this.participantsMarkers.length>0) {
      for (let participant of this.participantsMarkers) {
        this.participantsList.push({
          user: participant.user
        });
      }
    }
  }

  /**
   * It is called when the user changes page.
   * It stop the interval to retrieve the positions of the users.
   */
  ngOnDestroy(){
    if(this.refreshInterval){
      clearInterval(this.refreshInterval)
    }
  }

  initMap() {

    if (this.mapPoints.length > 0) {
      console.log('Route exists');
      this.initLat = this.mapPoints[0].lat;
      this.initLong = this.mapPoints[0].lng;
      this.getRoutePointsAndWaypoints();
    }
  }

  getRoutePointsAndWaypoints() {
    let waypoints = [];

    if (this.mapPoints.length > 2) {
      for (let i = 1; i < this.mapPoints.length - 1; i++) {
        let address = this.mapPoints[i];
        if (address !== "") {
          waypoints.push({
            location: address,
            stopover: false //show marker on map for each waypoint (true)
          });
        }
        this.updateDirections(this.mapPoints[0], this.mapPoints[this.mapPoints.length - 1], waypoints);
      }
    } else if (this.mapPoints.length > 1) {
      this.updateDirections(this.mapPoints[this.mapPoints.length - 2], this.mapPoints[this.mapPoints.length - 1], waypoints);
    } else {
      this.updateDirections(this.mapPoints[this.mapPoints.length - 1], this.mapPoints[this.mapPoints.length - 1], waypoints);
    }
  }


  updateDirections(originAddress, destinationAddress, waypoints) {
    this.directions = {
      origin: { lat: originAddress.lat, lng: originAddress.lng },
      destination: { lat: destinationAddress.lat, lng: destinationAddress.lng },
      waypoints: waypoints
    };
    console.log("[Directions][Update]", this.directions);
  }

  /**
   *  Called when a participant is selected
   * @param event
   */
  onChange(event){
    var participant = event.target.value;
    if(participant !== -1) {
      for (let p of this.participantsList) {
        this.selectedUser.push({
          user: p.user,
          select: (p.user.id === participant.id)
          }
        )
      }
    }else{
      this.selectedUser = [];
    }
  }
}

export interface Progress {
lat?: Number;
lng?: Number;
timestamp?: Number;
user: User;
select: Boolean;
icon?: String;
}