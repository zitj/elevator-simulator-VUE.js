export class Passenger {
	id: number;
	waitingOnFloorNumber: number;
	waitingForElevator: number;
	destinationFloor: number;
	status: string;

	constructor(id: number, waitingOnFloorNumber: number, waitingForElevator: number, destinationFloor: number) {
		this.id = id;
		this.waitingOnFloorNumber = waitingOnFloorNumber;
		this.waitingForElevator = waitingForElevator;
		this.destinationFloor = destinationFloor;
		this.status = 'waiting';
	}
}
