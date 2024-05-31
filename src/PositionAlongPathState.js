export class PositionAlongPathState {
    constructor() {
        this.startingDistance = 0.000001;
        this.currentDistanceOnPath = 0.000001;
        this.currentPercentageOnPath = 0.000001;
        this.targetDistance = 0;
        this.movementDuration = 2000; // how long it should take 
        this.lengthToScroll = 800; //How many scroll ticks are required to complete the loop. 
        this.lastScrollTime = 0;
    }
};