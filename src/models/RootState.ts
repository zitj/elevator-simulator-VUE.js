import { ElevatorState } from './ElevatorState';
import { FloorsState } from './FloorState';
import { PassengerState } from './PassengerState';

export interface RootState {
	floorsStore: FloorsState;
	elevatorsStore: ElevatorState;
	passengersStore: PassengerState;
}
