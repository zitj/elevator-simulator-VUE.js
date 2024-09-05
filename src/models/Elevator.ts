import { Passenger } from './Passenger';

interface Coordinates {
	x: number;
	y: number;
}

export class Elevator {
	id: number;
	status: string;
	currentFloor: number;
	currentFloorInMotion: number | null;
	coordinates: Coordinates;
	destinationFloor: number;
	passengersToPickUp: Passenger[];
	pickedUpPassengers: Passenger[];
	isPaused: boolean;
	domElement: HTMLElement | null;

	constructor(id: number, coordinates: Coordinates) {
		this.id = id;
		this.status = 'idle';
		this.currentFloor = 0;
		this.currentFloorInMotion = null;
		this.coordinates = coordinates;
		this.destinationFloor = 0;
		this.passengersToPickUp = [];
		this.pickedUpPassengers = [];
		this.isPaused = true;
		this.domElement = null;
	}
}
