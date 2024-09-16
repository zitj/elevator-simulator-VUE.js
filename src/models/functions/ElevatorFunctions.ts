import { Elevator } from '../../classes/Elevator';

export interface ElevatorFunctions {
	startMoving: (elevator: Elevator) => void;
	clearElevatorTimers: () => void;
}
