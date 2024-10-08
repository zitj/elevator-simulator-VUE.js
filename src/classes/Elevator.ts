import { Passenger } from './Passenger';

interface Coordinates {
	x: number;
	y: number;
}

export class Elevator {
	id: number;
	status: string;
	currentFloor: number;
	currentFloorInMotion: number;
	coordinates: Coordinates;
	destinationFloor: number;
	passengersCurrentFloor: number;
	passengersDestinationFloor: number;
	passengersToPickUp: Passenger[];
	pickedUpPassengers: Passenger[];
	isPaused: boolean;
	domElement: HTMLElement | null;
	isRandomlyCalled: boolean;
	passengerThatCalledFirst: Passenger | null;
	interval?: any;

	constructor(id: number, coordinates: Coordinates) {
		this.id = id;
		this.status = 'idle';
		this.currentFloor = 0;
		this.currentFloorInMotion = 0;
		this.coordinates = coordinates;
		this.destinationFloor = 0;
		this.passengersToPickUp = [];
		this.pickedUpPassengers = [];
		this.isPaused = true;
		this.domElement = null;
		this.passengersCurrentFloor = 0;
		this.passengersDestinationFloor = 0;
		this.isRandomlyCalled = false;
		this.passengerThatCalledFirst = null;
	}
}
