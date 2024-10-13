export function handleScroll(event, positionAlongPathState) {

	positionAlongPathState.lastScrollTime = performance.now();

	// When a new scroll starts, set the starting distance along the path to whatever the object's current distance is. 
	positionAlongPathState.startingDistance = positionAlongPathState.currentDistanceOnPath;

	const changeInScroll = Math.sign(event.deltaY);

	positionAlongPathState.targetDistance += changeInScroll / positionAlongPathState.lengthToScroll; 
}

export function updatePosition(curvePath, object, positionAlongPathState) {

	let timeElapsed = performance.now() - positionAlongPathState.lastScrollTime;

	if (timeElapsed < positionAlongPathState.movementDuration) {

		let interpolatedPositionOnPath;
	
		// The percentage complete towards the total time to animate, movementDuration.
		const timeLeftPercentage = timeElapsed / positionAlongPathState.movementDuration;
		
		const minimumDegreeOfChange = 1.2;
		const maximumDegreeOfChange = 4.0;
		// const minimumDegreeOfChange = 0.001;
		// const maximumDegreeOfChange = 0.9;
		// console.log("PERCENTAGE: ", positionAlongPathState.currentPercentageOnPath )

		let interpolationFactor = Math.max(timeLeftPercentage, minimumDegreeOfChange);
		interpolationFactor = Math.min(interpolationFactor, maximumDegreeOfChange);

		interpolatedPositionOnPath = (1 - interpolationFactor) * positionAlongPathState.startingDistance + interpolationFactor * positionAlongPathState.targetDistance;

		// Capture values before they are updated so we can compare things
		const previousPercentage = positionAlongPathState.currentPercentageOnPath
		const previousDistance = positionAlongPathState.currentDistanceOnPath

		positionAlongPathState.currentDistanceOnPath = interpolatedPositionOnPath;
		positionAlongPathState.currentPercentageOnPath = positionAlongPathState.currentDistanceOnPath < 0 ? (1 - (Math.abs(positionAlongPathState.currentDistanceOnPath) % 1)) : positionAlongPathState.currentDistanceOnPath % 1;

		// Capture values after they are updated so we can compare things
		const nextPercentage = positionAlongPathState.currentPercentageOnPath
		const percentageDiff = previousPercentage - nextPercentage

		// The scroll functionality operates on a loop, so if a user scrolls backwards
		// before the starting position, they will be brought to the end of the curve that
		// is being traversed. This detects the change from the start -> end and resets things
		// to the start of the curve so the user can't go behind the scroll origin.
		if (previousPercentage && nextPercentage && percentageDiff < -0.1) {
			positionAlongPathState.currentDistanceOnPath = 0.000001
			positionAlongPathState.currentPercentageOnPath = 0.000001
			positionAlongPathState.startingDistance = 0.000001
			positionAlongPathState.targetDistance = 0.000001
		}

		// The scroll functionality operates on a loop, so if a user scrolls forwards
		// after the end position, they will be brought back to the start of the curve that
		// is being traversed. This detects the change from the end -> start and resets things
		// to the end of the curve so the user can't go past the scroll final position.
		if (previousPercentage && nextPercentage && percentageDiff > 0.1) {
			positionAlongPathState.currentDistanceOnPath = previousPercentage
			positionAlongPathState.currentPercentageOnPath = previousDistance
			positionAlongPathState.startingDistance = 0.998
			positionAlongPathState.targetDistance = 0.998
		}

		if (typeof positionAlongPathState.currentPercentageOnPath === 'undefined') {
			currentPercentageOnPath = 0.001;
		}
	
		let lookAtPosition = positionAlongPathState.currentPercentageOnPath + 0.00001;

		if (typeof lookAtPosition === 'undefined') {
			lookAtPosition = 0.998
		}

		try {
			const newPosition = curvePath.getPointAt(positionAlongPathState.currentPercentageOnPath);
			const newLookAt = curvePath.getPointAt(lookAtPosition);

			// look slightly above the curve path
			newLookAt.y += 0.0001	

			object.position.copy(newPosition);
			object.lookAt(newLookAt);
		} catch (error) {
			console.error(error)
		}

		return positionAlongPathState.currentPercentageOnPath

	}
}