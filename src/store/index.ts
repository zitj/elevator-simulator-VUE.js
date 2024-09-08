import { Elevator } from '@/classes/Elevator';
import { Passenger } from '@/classes/Passenger';
import { Floor } from '@/classes/Floor';
import { createStore, StoreOptions } from 'vuex';
import { STATUS } from '@/constants/status';

interface State {
	numberOfFloors: number;
	numberOfElevators: number;
	passengersCurrentFloorCall: number;
	passengersDestinationFloorCall: number;
	elevators: Elevator[];
	passengers: Passenger[];
	floors: Floor[];
	nearestElevator: Elevator | null;
}

const state: State = {
	numberOfFloors: 0,
	numberOfElevators: 0,
	passengersCurrentFloorCall: 0,
	passengersDestinationFloorCall: 0,
	elevators: [],
	passengers: [],
	floors: [],
	nearestElevator: null,
};

const mutations = {
	SET_NUMBER_OF_FLOORS(state: State, floors: number) {
		state.numberOfFloors = floors;
		state.floors = Array.from({ length: floors }, (_, id) => {
			return new Floor(id);
		});
	},
	SET_NUMBER_OF_ELEVATORS(state: State, elevators: number) {
		state.numberOfElevators = elevators;
		state.elevators = Array.from({ length: elevators }, (_, id) => {
			const floorHeight = 50;
			const x = id * 60;
			const y = floorHeight * state.numberOfFloors + state.numberOfFloors - 1;
			return new Elevator(id, { x, y: y - 50 });
		});
	},

	RESET_ELEVATORS(state: State): void {
		state.elevators = [];
	},
	RESET_STATE(state: State): void {
		state.numberOfFloors = 0;
		state.numberOfElevators = 0;
		state.passengersCurrentFloorCall = 0;
		state.passengersDestinationFloorCall = 0;
		state.elevators = [];
		state.passengers = [];
		state.floors = [];
		state.nearestElevator = null;
	},
	SET_PASSENGERS_CURRENT_FLOOR_CALL(state: State, passengersCurrentFloorCall: number): void {
		state.passengersCurrentFloorCall = passengersCurrentFloorCall;
	},
	SET_PASSENGERS_DESTINATION_FLOOR_CALL(state: State, passengersDestinationFloorCall: number): void {
		state.passengersDestinationFloorCall = passengersDestinationFloorCall;
	},
	SET_NEAREST_ELEVATOR(state: State, elevator: Elevator): void {
		state.nearestElevator = elevator;
	},
	CALL_ELEVATOR(state: State, payload: { currentFloor: number; destinationFloor: number }): { currentFloor: number; destinationFloor: number } {
		return payload;
	},
	UPDATE_NEAREST_ELEVATOR(state: State, payload: Partial<Elevator>): void {
		if (state.nearestElevator) {
			Object.assign(state.nearestElevator, payload);
		}
	},
	UPDATE_ELEVATORS(state: State, elevators: Elevator[]): void {
		state.elevators = [...elevators];
	},
	UPDATE_ELEVATOR(state: State, updatedElevator: Elevator): void {
		state.elevators.forEach((elevator) => {
			if (elevator.id == updatedElevator.id) elevator = { ...updatedElevator };
		});
	},
	ADD_NEW_PASSENGER(state: State, { currentFloorNumber, nearestElevator }: { currentFloorNumber: number; destinationFloorNumber: number; nearestElevator: Elevator }): void {
		const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const passanger = new Passenger(uniqueId, currentFloorNumber, nearestElevator.id, state.passengersDestinationFloorCall);
		passanger.position = { left: nearestElevator.coordinates.x + 10, top: nearestElevator.coordinates.y };
		state.passengers.push(passanger);
		state.elevators.forEach((elevator) => {
			if (elevator.id === nearestElevator.id) elevator.passengersToPickUp.push(passanger);
		});
	},
	PICK_UP_PASSENGER(state: State, nearestElevator: Elevator): void {
		state.elevators.forEach((elevator: Elevator) => {
			if (elevator.id == nearestElevator.id) {
				elevator.passengersToPickUp.forEach((passenger, index) => {
					if (passenger.status == STATUS.WAITING && passenger.waitingOnFloorNumber == elevator.currentFloorInMotion) {
						passenger.status = STATUS.PICKED_UP;
						elevator.passengersToPickUp.splice(index, 1);
						elevator.pickedUpPassengers.push(passenger);
					}
				});
			}
		});
	},
	DROP_PASSANGER(state: State, nearestElevator: Elevator): void {
		state.elevators.forEach((elevator: Elevator) => {
			if (elevator.id == nearestElevator.id) {
				elevator.pickedUpPassengers = elevator.pickedUpPassengers.filter((passenger) => {
					if (passenger.status == STATUS.PICKED_UP && passenger.destinationFloor == elevator.currentFloorInMotion) {
						passenger.status = STATUS.DROPPED;
						return false;
					} else {
						return true;
					}
				});
			}
		});
	},
};

const actions = {
	updateNumberOfFloors({ commit }: { commit: any }, floors: number) {
		commit('SET_NUMBER_OF_FLOORS', floors);
	},
	updateNumberOfElevators({ commit }: { commit: any }, elevators: number) {
		commit('SET_NUMBER_OF_ELEVATORS', elevators);
	},
	updatePassengersCurrentFloorCall({ commit }: { commit: any }, passengersCurrentFloorCall: number) {
		commit('SET_PASSENGERS_CURRENT_FLOOR_CALL', passengersCurrentFloorCall);
	},
	updatePassengersDestinationFloorCall({ commit }: { commit: any }, passengersDestinationFloorCall: number) {
		commit('SET_PASSENGERS_DESTINATION_FLOOR_CALL', passengersDestinationFloorCall);
	},
	updateNearestElevator({ commit }: { commit: any }, elevator: Elevator) {
		commit('SET_NEAREST_ELEVATOR', elevator);
	},
	updateElevator({ commit }: { commit: any }, elevator: Elevator) {
		commit('UPDATE_ELEVATOR', elevator);
	},

	callElevator({ commit, dispatch }: { commit: any; dispatch: any }, payload: { currentFloor: number; destinationFloor: number }) {
		commit('CALL_ELEVATOR', payload);
	},

	updateNearestElevatorProperties({ commit }: { commit: any }, payload: Partial<Elevator>) {
		commit('UPDATE_NEAREST_ELEVATOR', payload);
	},
	resetElevators({ commit }: { commit: any }) {
		commit('RESET_ELEVATORS');
	},
	updateElevators({ commit }: { commit: any }, elevators: Elevator[]) {
		commit('UPDATE_ELEVATORS', elevators);
	},
	passengerShowsUp({ commit }: { commit: any }, details: { currentFloorNumber: number; destinationFloorNumber: number; nearestElevator: Elevator }) {
		commit('ADD_NEW_PASSENGER', details);
	},
	pickUpPassenger({ commit }: { commit: any }, nearestElevator: Elevator) {
		commit('PICK_UP_PASSENGER', nearestElevator);
	},
	dropPassangerOnDestinationFloor({ commit }: { commit: any }, nearestElevator: Elevator) {
		commit('DROP_PASSANGER', nearestElevator);
	},
	resetGeneralState({ commit }: { commit: any }) {
		commit('RESET_STATE');
	},
};

const getters = {
	numberOfFloors: (state: State) => state.numberOfFloors,
	numberOfElevators: (state: State) => state.numberOfElevators,
	elevators: (state: State) => state.elevators,
	passengers: (state: State) => state.passengers,
	floors: (state: State) => state.floors,
	passengersCurrentFloorCall: (state: State) => state.passengersCurrentFloorCall,
	passengersDestinationFloorCall: (state: State) => state.passengersDestinationFloorCall,
	nearestElevator: (state: State) => state.nearestElevator,
	latestElevatorCall: (state: State) => {
		if (state.passengersCurrentFloorCall && state.passengersDestinationFloorCall) {
			return {
				passengersCurrentFloorCall: state.passengersCurrentFloorCall,
				passengersDestinationFloorCall: state.passengersDestinationFloorCall,
				elevators: state.elevators,
			};
		} else {
			return null;
		}
	},
};

const storeOptions: StoreOptions<State> = {
	state,
	mutations,
	actions,
	getters,
};

export const store = createStore<State>(storeOptions);
