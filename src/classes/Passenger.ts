import { STATUS } from '@/constants/status';

export class Passenger {
	id: string;
	waitingOnFloorNumber: number;
	waitingForElevator: number;
	destinationFloor: number;
	status: string;
	position: { left: number; top: number } | null;

	constructor(id: string, waitingOnFloorNumber: number, waitingForElevator: number, destinationFloor: number) {
		this.id = id;
		this.waitingOnFloorNumber = waitingOnFloorNumber;
		this.waitingForElevator = waitingForElevator;
		this.destinationFloor = destinationFloor;
		this.status = STATUS.WAITING;
		this.position = null;
	}
}
