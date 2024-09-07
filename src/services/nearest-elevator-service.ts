import { Elevator } from '@/classes/Elevator';
import { STATUS } from '../constants/status';

export function nearestAvailableElevatorFor(passangerCurrentFloor: number, destinationFloor: number, elevators: Elevator[]) {
	let arrayOfDifferencesInFloors: any[] = [];
	for (let i = 0; i < elevators.length; i++) {
		let differenceInFloors = 0;

		if (elevators[i].status == STATUS.IDLE) {
			differenceInFloors = Math.abs(passangerCurrentFloor - elevators[i].currentFloor);
		}
		if (elevators[i].status !== STATUS.IDLE) {
			if (elevators[i].currentFloorInMotion !== null) {
				// differenceInFloors = Math.abs(+(elevators[i].currentFloorInMotion ?? 0 - passangerCurrentFloor));
				// if (elevators[i].status === STATUS.MOVING_UP || elevators[i].destinationFloor - elevators[i].currentFloorInMotion > 0) {
				// 	if (Math.abs(destinationFloor - elevators[i].destinationFloor) < Math.abs(elevators[i].currentFloorInMotion - elevators[i].destinationFloor)) {
				// 		// differenceInFloors = Math.abs(elevators[i].destinationFloor - elevators[i].currentFloorInMotion) + Math.abs(elevators[i].destinationFloor - destinationFloor);
				// 		// console.log(differenceInFloors);
				// 	}
				// }
				// if (elevators[i].status === STATUS.MOVING_DOWN || elevators[i].destinationFloor - elevators[i].currentFloorInMotion < 0) {
				// 	if (passangerCurrentFloor < destinationFloor) {
				// 		differenceInFloors = Math.abs(+(elevators[i].destinationFloor - elevators[i].currentFloorInMotion)) + Math.abs(destinationFloor);
				// 	}
				// }
			}
		}
		const elevator = {
			id: elevators[i].id,
			differenceInFloors,
			status: elevators[i].status,
			destinationFloor,
			passangerCurrentFloor,
			currentFloor: elevators[i].currentFloorInMotion ? elevators[i].currentFloorInMotion : elevators[i].currentFloor,
			elevatorCurrentDestinationFloor: elevators[i].destinationFloor,
		};
		arrayOfDifferencesInFloors.push(elevator);
		arrayOfDifferencesInFloors = arrayOfDifferencesInFloors.filter(
			(elevator) =>
				!(elevator.status === STATUS.MOVING_DOWN && elevator.currentFloor < passangerCurrentFloor) && !(elevator.status === STATUS.MOVING_UP && elevator.currentFloor > passangerCurrentFloor)
		);
	}

	arrayOfDifferencesInFloors.sort((a, b) => {
		const aIsMovingDownAndBelow = a.status === STATUS.MOVING_DOWN && a.currentFloor < passangerCurrentFloor;
		const aIsMovingUpAndAbove = a.status === STATUS.MOVING_UP && a.currentFloor > passangerCurrentFloor;
		const bIsMovingDownAndBelow = b.status === STATUS.MOVING_DOWN && b.currentFloor < passangerCurrentFloor;
		const bIsMovingUpAndAbove = b.status === STATUS.MOVING_UP && b.currentFloor > passangerCurrentFloor;

		if (aIsMovingDownAndBelow && !bIsMovingDownAndBelow) return 1;
		if (!aIsMovingDownAndBelow && bIsMovingDownAndBelow) return -1;
		if (aIsMovingUpAndAbove && !bIsMovingUpAndAbove) return 1;
		if (!aIsMovingUpAndAbove && bIsMovingUpAndAbove) return -1;

		if (a.differenceInFloors === b.differenceInFloors) {
			if (a.status === STATUS.IDLE && b.status !== STATUS.IDLE) return -1;
			if (a.status !== STATUS.IDLE && b.status === STATUS.IDLE) return 1;
			return 0;
		}
		return +a.differenceInFloors - +b.differenceInFloors;
	});

	const nearestElevatorID = arrayOfDifferencesInFloors[0] ? arrayOfDifferencesInFloors[0].id : null;
	// elevatorsDOM.childNodes.forEach((elevatorDOMelement) => {
	// 	if (elevatorDOMelement.dataset.id == nearestElevatorID) {
	// 		elevators[nearestElevatorID].domElement = elevatorDOMelement;
	// 	}
	// });
	// console.log('Array of differences in floors', arrayOfDifferencesInFloors);
	return elevators[nearestElevatorID];
}
