const MAX_PATH_POSITION = 1
const MIN_PATH_POSITION = 0

function clampPathPosition(value) {
	return Math.min(MAX_PATH_POSITION, Math.max(MIN_PATH_POSITION, value))
}

function applyPathPosition(curvePath, object, positionAlongPathState) {
	const positionOnPath = positionAlongPathState.currentPercentageOnPath

	const newPosition = curvePath.getPointAt(positionOnPath)

	// Look one step ahead along the path tangent. Using the tangent (rather than a
	// second sampled point) keeps a valid forward direction even at the very end of
	// the path, where two sampled points would coincide and make the camera pitch up.
	const tangent = curvePath.getTangentAt(Math.min(positionOnPath, 0.999999))
	const newLookAt = newPosition.clone().add(tangent)

	// Look slightly above the curve path
	newLookAt.y += 0.001

	object.position.copy(newPosition)
	object.lookAt(newLookAt)
}

export function handleScroll(event, positionAlongPathState) {
	positionAlongPathState.lastScrollTime = performance.now()

	positionAlongPathState.startingDistance = positionAlongPathState.currentDistanceOnPath

	const changeInScroll = Math.sign(event.deltaY)

	positionAlongPathState.targetDistance = clampPathPosition(
		positionAlongPathState.targetDistance + changeInScroll / positionAlongPathState.lengthToScroll
	)
}

export function updatePosition(curvePath, object, positionAlongPathState) {
	const timeElapsed = performance.now() - positionAlongPathState.lastScrollTime

	if (timeElapsed < positionAlongPathState.movementDuration) {
		const timeLeftPercentage = timeElapsed / positionAlongPathState.movementDuration

		const minimumDegreeOfChange = 0.3
		const maximumDegreeOfChange = 2.0

		let interpolationFactor = Math.max(timeLeftPercentage, minimumDegreeOfChange)
		interpolationFactor = Math.min(interpolationFactor, maximumDegreeOfChange)
		interpolationFactor = easeInOutCubic(interpolationFactor)

		const interpolatedPositionOnPath =
			(1 - interpolationFactor) * positionAlongPathState.startingDistance
			+ interpolationFactor * positionAlongPathState.targetDistance

		positionAlongPathState.currentDistanceOnPath = clampPathPosition(interpolatedPositionOnPath)
	} else {
		positionAlongPathState.currentDistanceOnPath = positionAlongPathState.targetDistance
	}

	positionAlongPathState.currentPercentageOnPath = positionAlongPathState.currentDistanceOnPath
	applyPathPosition(curvePath, object, positionAlongPathState)

	return positionAlongPathState.currentPercentageOnPath
}

function easeInOutCubic(x) {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
