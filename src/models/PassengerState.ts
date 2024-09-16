import { Passenger } from '@/classes/Passenger';

export interface PassengerState {
	passengers: Passenger[];
	passengersCurrentFloorCall: number;
	passengersDestinationFloorCall: number;
}
