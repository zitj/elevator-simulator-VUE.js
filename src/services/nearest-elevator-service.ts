import { Elevator } from '@/classes/Elevator';
import { STATUS } from '../constants/status';

interface ElevatorDifference {
	id: number;
	differenceInFloors: number;
	status: string;
	destinationFloor: number | null;
	passangerCurrentFloor: number;
	currentFloor: number;
}

export function nearestAvailableElevatorFor(passangerCurrentFloor: number, destinationFloor: number, elevators: Elevator[]) {
	const arrayOfDifferencesInFloors: ElevatorDifference[] = [];
	for (let i = 0; i < elevators.length; i++) {
		let differenceInFloors = 0;
		if (elevators[i].status === STATUS.READY) differenceInFloors = Infinity;
		if (elevators[i].status === STATUS.IDLE) {
			differenceInFloors = Math.abs(passangerCurrentFloor - elevators[i].currentFloor) + Math.abs(passangerCurrentFloor - destinationFloor);
			// console.log(`${elevators[i].id} IDLE DIFFERENCE: `, differenceInFloors);
		}
		if (elevators[i].status === STATUS.MOVING_UP) {
			differenceInFloors = Math.abs(elevators[i].destinationFloor - passangerCurrentFloor) + Math.abs(destinationFloor - elevators[i].destinationFloor);
			// console.log(`${elevators[i].id} MOVING UP DIFFERENCE: `, differenceInFloors);
		}
		if (elevators[i].status === STATUS.MOVING_DOWN) {
			differenceInFloors = Math.abs(elevators[i].currentFloorInMotion - passangerCurrentFloor) + Math.abs(elevators[i].currentFloorInMotion - destinationFloor);
			// console.log(`${elevators[i].id} MOVING DOWN DIFFERENCE: `, differenceInFloors);
		}
		const difference: ElevatorDifference = {
			id: elevators[i].id,
			differenceInFloors,
			status: elevators[i].status,
			destinationFloor,
			passangerCurrentFloor,
			currentFloor: elevators[i].currentFloorInMotion ? elevators[i].currentFloorInMotion : elevators[i].currentFloor,
		};
		arrayOfDifferencesInFloors.push(difference);
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

	if (nearestElevatorID !== null) return elevators[nearestElevatorID];
}
