import { Elevator } from '@/classes/Elevator';
import { STATUS } from '../constants/status';
import { Passenger } from '@/classes/Passenger';

interface ElevatorDifference {
	id: number;
	differenceInFloors: number;
	status: string;
	passengerDestinationFloor: number | null;
	passengerCurrentFloor: number;
	elevatorsCurrentFloor: number;
}

export function nearestAvailableElevatorFor(passengerCurrentFloor: number, passengerDestinationFloor: number, elevators: Elevator[]) {
	const arrayOfDifferencesInFloors: ElevatorDifference[] = [];

	for (let i = 0; i < elevators.length; i++) {
		let differenceInFloors = 0;
		const passengerThatCalledFirst: Passenger | null = elevators[i].passengerThatCalledFirst;
		const finalDestination = passengerThatCalledFirst?.destinationFloor;
		const status = elevators[i].status;
		const elevatorsCurrentFloor = elevators[i].currentFloorInMotion !== null && elevators[i].currentFloorInMotion !== undefined ? elevators[i].currentFloorInMotion : elevators[i].currentFloor;
		const elevatorsDestinationFloor = elevators[i].destinationFloor;
		if (status === STATUS.READY) {
			differenceInFloors = Infinity;
			if (finalDestination !== null && finalDestination !== undefined && finalDestination !== elevatorsCurrentFloor) {
				if (passengerCurrentFloor <= elevatorsCurrentFloor && passengerDestinationFloor >= finalDestination) {
					differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerDestinationFloor);
				}
			}
			if (finalDestination !== null && finalDestination !== undefined && finalDestination == elevatorsCurrentFloor) {
				differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerCurrentFloor) + Math.abs(passengerCurrentFloor - passengerDestinationFloor);
			}
			if (finalDestination !== null && finalDestination !== undefined && passengerCurrentFloor < finalDestination && passengerDestinationFloor == finalDestination) {
				differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerCurrentFloor) + Math.abs(passengerCurrentFloor - finalDestination);
			}
		}
		if (status === STATUS.IDLE) {
			differenceInFloors = Math.abs(passengerCurrentFloor - elevatorsCurrentFloor) + Math.abs(passengerCurrentFloor - passengerDestinationFloor);
		}
		if (status === STATUS.MOVING_UP) {
			differenceInFloors = Math.abs(elevatorsDestinationFloor - passengerCurrentFloor) + Math.abs(passengerDestinationFloor - elevatorsDestinationFloor);
			if (passengerThatCalledFirst && passengerThatCalledFirst.waitingOnFloorNumber < passengerCurrentFloor && finalDestination && elevatorsCurrentFloor - passengerCurrentFloor > 0) {
				differenceInFloors = Infinity;
			}
		}
		if (status === STATUS.MOVING_DOWN) {
			differenceInFloors = Infinity;
			if (elevatorsCurrentFloor >= passengerCurrentFloor && finalDestination !== null && finalDestination !== undefined && passengerDestinationFloor <= finalDestination) {
				differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerCurrentFloor) + Math.abs(passengerCurrentFloor - passengerDestinationFloor);
			}

			if (finalDestination !== null && finalDestination !== undefined && passengerDestinationFloor >= finalDestination && passengerCurrentFloor <= elevatorsCurrentFloor) {
				differenceInFloors = Math.abs(elevatorsCurrentFloor - passengerCurrentFloor) + Math.abs(passengerCurrentFloor - finalDestination);
			}
		}
		const difference: ElevatorDifference = {
			id: elevators[i].id,
			differenceInFloors,
			status: elevators[i].status,
			passengerDestinationFloor,
			passengerCurrentFloor,
			elevatorsCurrentFloor,
		};
		arrayOfDifferencesInFloors.push(difference);
	}

	arrayOfDifferencesInFloors.sort((a, b) => {
		const aIsMovingDownAndBelow = a.status === STATUS.MOVING_DOWN && a.elevatorsCurrentFloor < passengerCurrentFloor;
		const aIsMovingUpAndAbove = a.status === STATUS.MOVING_UP && a.elevatorsCurrentFloor > passengerCurrentFloor;
		const bIsMovingDownAndBelow = b.status === STATUS.MOVING_DOWN && b.elevatorsCurrentFloor < passengerCurrentFloor;
		const bIsMovingUpAndAbove = b.status === STATUS.MOVING_UP && b.elevatorsCurrentFloor > passengerCurrentFloor;

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
