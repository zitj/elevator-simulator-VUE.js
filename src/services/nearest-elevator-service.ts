import { Elevator } from '@/classes/Elevator';
import { STATUS } from '../constants/status';
import { Passenger } from '@/classes/Passenger';

interface ElevatorDifference {
	id: number;
	differenceInFloors: number;
	status: string;
	passengerDestinationFloor: number | null;
	passengerCurrentFloor: number;
	currentFloor: number;
}

export function nearestAvailableElevatorFor(passengerCurrentFloor: number, passengerDestinationFloor: number, elevators: Elevator[]) {
	const arrayOfDifferencesInFloors: ElevatorDifference[] = [];

	for (let i = 0; i < elevators.length; i++) {
		let differenceInFloors = 0;
		const passengerThatCalledFirst: Passenger | null = elevators[i].passengerThatCalledFirst;
		const finalDestination = passengerThatCalledFirst?.destinationFloor;
		const status = elevators[i].status;
		const elevatorsCurrentFloor = elevators[i].currentFloorInMotion ? elevators[i].currentFloorInMotion : elevators[i].currentFloor;
		const elevatorsDestinationFloor = elevators[i].destinationFloor;

		if (status === STATUS.READY) {
			if (finalDestination) {
				if (passengerCurrentFloor <= elevatorsCurrentFloor && passengerDestinationFloor >= finalDestination) {
					differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerDestinationFloor);
				}
			}
		}
		if (status === STATUS.IDLE) {
			differenceInFloors = Math.abs(passengerCurrentFloor - elevatorsCurrentFloor) + Math.abs(passengerCurrentFloor - passengerDestinationFloor);
			// console.log(`${elevators[i].id} IDLE DIFFERENCE: `, differenceInFloors);
		}
		if (status === STATUS.MOVING_UP) {
			differenceInFloors = Math.abs(elevatorsDestinationFloor - passengerCurrentFloor) + Math.abs(passengerDestinationFloor - elevatorsDestinationFloor);
			// console.log(`${elevators[i].id} MOVING UP DIFFERENCE: `, differenceInFloors);
		}
		if (status === STATUS.MOVING_DOWN) {
			differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerCurrentFloor) + Math.abs(elevatorsCurrentFloor - passengerDestinationFloor);
			// console.log(`${elevators[i].id} MOVING DOWN DIFFERENCE: `, differenceInFloors);
		}

		const difference: ElevatorDifference = {
			id: elevators[i].id,
			differenceInFloors,
			status: elevators[i].status,
			passengerDestinationFloor,
			passengerCurrentFloor,
			currentFloor: elevators[i].currentFloorInMotion ? elevators[i].currentFloorInMotion : elevators[i].currentFloor,
		};
		arrayOfDifferencesInFloors.push(difference);
	}

	arrayOfDifferencesInFloors.sort((a, b) => {
		const aIsMovingDownAndBelow = a.status === STATUS.MOVING_DOWN && a.currentFloor < passengerCurrentFloor;
		const aIsMovingUpAndAbove = a.status === STATUS.MOVING_UP && a.currentFloor > passengerCurrentFloor;
		const bIsMovingDownAndBelow = b.status === STATUS.MOVING_DOWN && b.currentFloor < passengerCurrentFloor;
		const bIsMovingUpAndAbove = b.status === STATUS.MOVING_UP && b.currentFloor > passengerCurrentFloor;

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
