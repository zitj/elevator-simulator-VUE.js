import { Elevator } from '@/classes/Elevator';

export interface ElevatorState {
	numberOfElevators: number;
	elevators: Elevator[];
	nearestElevator: Elevator | null;
	ongoingRequestsExist: boolean;
}
