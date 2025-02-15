export class PositionAlongPathState {
    constructor() {
        this.startingDistance = 0.000001;
        this.currentDistanceOnPath = 0.000001;
        this.currentPercentageOnPath = 0.000001;
        this.targetDistance = 0;
        this.movementDuration = 2500; // Reduced from 4000 to maintain speed while allowing for smoother interpolation
        this.lengthToScroll = 3000; //How many scroll ticks are required to complete the loop. 
        this.lastScrollTime = 0;
    }
};