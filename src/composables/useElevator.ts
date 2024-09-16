import { Elevator } from '@/classes/Elevator';
import { Passenger } from '@/classes/Passenger';
import { STATUS } from '@/constants/status';
import { computed } from 'vue';
import { store } from '../store/index';

export function useElevator(): { startMoving: (elevator: Elevator) => void; clearElevatorTimers: () => void } {
	const movementInterval = 700;
	const floors = computed(() => {
		return store.getters['floorsStore/floors'];
	});

	let timeouts: number[] = [];
	let timerIntervals: number[] = [];
	const ongoingRequestExist = computed(() => store.getters['elevatorsStore/ongoingRequestsExist']);

	const updateNearestElevatorProperties = (elevatorProperties: Partial<Elevator>) => {
		store.dispatch('elevatorsStore/updateNearestElevatorProperties', elevatorProperties);
	};
	const dropPassangerOnDestinationFloor = (elevator: Elevator) => {
		store.dispatch('passengersStore/dropPassangerOnDestinationFloor', elevator);
	};
	const pickUpPassenger = (elevator: Elevator) => {
		store.dispatch('passengersStore/pickUpPassenger', elevator);
	};

	const checkIfThereArePassangersWaitingOnThisFloor = (elevator: Elevator): void => {
		const currentFloor = elevator.currentFloorInMotion ? elevator.currentFloorInMotion : elevator.currentFloor;
		elevator.passengersToPickUp.forEach((passanger, index) => {
			if (passanger.waitingOnFloorNumber == currentFloor) {
				stopMoving(elevator);
				const timeout = setTimeout(() => {
					clearTimeout(timeout);
					elevator.status = STATUS.READY;
					pickUpPassenger(elevator);
					startMoving(elevator);
				}, movementInterval);
				timeouts.push(timeout);
			}
		});
	};

	const checkIfThereArePassengersToDropOnThisFloor = (elevator: Elevator): void => {
		elevator.pickedUpPassengers.forEach((passenger) => {
			if (passenger.destinationFloor == elevator.currentFloorInMotion) {
				stopMoving(elevator);
				const timeout = setTimeout(() => {
					clearTimeout(timeout);
					elevator.status = STATUS.READY;
					dropPassangerOnDestinationFloor(elevator);
					startMoving(elevator);
				}, movementInterval);
				timeouts.push(timeout);
			}
		});
	};

	const moveToNextFloor = (elevator: Elevator): void => {
		if (elevator.status === STATUS.MOVING_UP && elevator.currentFloorInMotion < floors.value.length - 1) {
			++elevator.currentFloorInMotion;
			elevator.coordinates.y = elevator.coordinates.y - 50 - 1;
		}
		if (elevator.status === STATUS.MOVING_DOWN && elevator.currentFloorInMotion > 0) {
			--elevator.currentFloorInMotion;
			elevator.coordinates.y = elevator.coordinates.y + 50 + 1;
		}
		checkIfThereArePassangersWaitingOnThisFloor(elevator);
		checkIfThereArePassengersToDropOnThisFloor(elevator);
	};

	const returnHighestFloorOfPassangersToPickUp = (passangers: Passenger[]): number | null => {
		if (passangers && passangers.length > 0) {
			return passangers.sort((a, b) => b.waitingOnFloorNumber - a.waitingOnFloorNumber)[0].waitingOnFloorNumber;
		} else {
			return null;
		}
	};

	const returnDestinationFloorToLeave = (elevator: Elevator): number | null => {
		const passangers = elevator.pickedUpPassengers;
		const passangersWaiting: boolean = elevator.passengersToPickUp && elevator.passengersToPickUp.length > 0 ? true : false;

		if (passangers && passangers.length > 0 && !passangersWaiting) {
			if (elevator.status === STATUS.MOVING_DOWN) return passangers.sort((a, b) => a.destinationFloor - b.destinationFloor)[0].destinationFloor;
			if (elevator.status === STATUS.MOVING_UP) return passangers.sort((a, b) => b.destinationFloor - a.destinationFloor)[0].destinationFloor;
			if (elevator.status === STATUS.READY) {
				return passangers.sort((a, b) => a.destinationFloor - b.destinationFloor)[0].destinationFloor;
			}
		}
		return null;
	};

	const moveElevator = (elevator: Elevator): void => {
		if (elevator.status === STATUS.READY) pickUpPassenger(elevator);
		const highestDestinationFloor = returnHighestFloorOfPassangersToPickUp(elevator.passengersToPickUp);
		const destinationFloor: number | null = returnDestinationFloorToLeave(elevator);
		if (highestDestinationFloor !== null) elevator.destinationFloor = Math.abs(highestDestinationFloor);
		if (destinationFloor !== null && highestDestinationFloor == null) elevator.destinationFloor = Math.abs(destinationFloor);
		const distance = elevator.currentFloorInMotion - elevator.destinationFloor;
		if (distance == 0 && elevator.passengersToPickUp.length == 0 && elevator.pickedUpPassengers.length == 0) elevator.status = STATUS.IDLE;
		if (distance == 0 && (elevator.passengersToPickUp.length !== 0 || elevator.pickedUpPassengers.length !== 0)) {
			stopMoving(elevator);
			elevator.status = STATUS.READY;
			startMoving(elevator);
		}

		if (distance > 0) elevator.status = STATUS.MOVING_DOWN;
		if (distance < 0) elevator.status = STATUS.MOVING_UP;
		const buildingHeight = 50 * (floors.value.length - 1) + (floors.value.length - 1);
		if (elevator.coordinates.y + 50 + 1 > buildingHeight && elevator.status == STATUS.MOVING_DOWN && elevator.currentFloorInMotion > 0) {
			elevator.currentFloorInMotion = 0;
			elevator.status = STATUS.MOVING_UP;
		}

		if (elevator.status == STATUS.IDLE && elevator.currentFloorInMotion == elevator.destinationFloor) {
			elevator.currentFloor = elevator.destinationFloor;
			elevator.passengerThatCalledFirst = null;
			stopMoving(elevator);
		}

		if (elevator.currentFloorInMotion !== elevator.destinationFloor) {
			if (elevator.status === STATUS.MOVING_UP || elevator.status === STATUS.MOVING_DOWN) moveToNextFloor(elevator);
		}
	};

	const stopMoving = (elevator: Elevator): void => {
		if (elevator.interval !== null) {
			elevator.isPaused = true;
			clearInterval(elevator.interval);
			elevator.interval = null;
			updateNearestElevatorProperties({ interval: elevator.interval });
		}
	};

	const startMoving = (elevator: Elevator): void => {
		const thereAreNoRequests = !ongoingRequestExist.value;
		if (thereAreNoRequests) return;
		clearElevatorTimers();
		elevator.isPaused = false;
		if (elevator.interval === null || elevator.interval === undefined) {
			elevator.interval = setInterval(() => {
				moveElevator(elevator);
			}, movementInterval);
			updateNearestElevatorProperties({ interval: elevator.interval });
			timerIntervals.push(elevator.interval);
		}
	};

	const clearElevatorTimers = (): void => {
		timerIntervals.forEach((timer) => clearInterval(timer));
		timeouts.forEach((timeout) => clearTimeout(timeout));
		timerIntervals = [];
		timeouts = [];
	};

	return { startMoving, clearElevatorTimers };
}
