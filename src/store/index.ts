import { Elevator } from '@/classes/Elevator';
import { Passenger } from '@/classes/Passenger';
import { Floor } from '@/classes/Floor';
import { createStore, StoreOptions } from 'vuex';
import { nearestAvailableElevatorFor } from '@/services/nearest-elevator-service';
import { STATUS } from '@/constants/status';

// Define the state interface
interface State {
	numberOfFloors: number;
	numberOfElevators: number;
	passengersCurrentFloorCall: number;
	passengersDestinationFloorCall: number;
	elevators: Elevator[];
	passangers: Passenger[];
	floors: Floor[];
	nearestElevator: Elevator | null;
}

// Define the initial state
const state: State = {
	numberOfFloors: 0,
	numberOfElevators: 0,
	passengersCurrentFloorCall: 0,
	passengersDestinationFloorCall: 0,
	elevators: [],
	passangers: [],
	floors: [],
	nearestElevator: null,
};

// Define the mutations
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

	RESET_ELEVATORS(state: State) {
		state.elevators = [];
	},
	SET_PASSENGERS_CURRENT_FLOOR_CALL(state: State, passengersCurrentFloorCall: number) {
		state.passengersCurrentFloorCall = passengersCurrentFloorCall;
	},
	SET_PASSENGERS_DESTINATION_FLOOR_CALL(state: State, passengersDestinationFloorCall: number) {
		state.passengersDestinationFloorCall = passengersDestinationFloorCall;
	},
	SET_NEAREST_ELEVATOR(state: State, elevator: Elevator) {
		state.nearestElevator = elevator;
	},
	CALL_ELEVATOR(state: State, payload: { currentFloor: number; destinationFloor: number }) {
		return payload;
	},
	UPDATE_NEAREST_ELEVATOR(state: State, payload: Partial<Elevator>) {
		if (state.nearestElevator) {
			Object.assign(state.nearestElevator, payload);
		}
	},
	UPDATE_ELEVATORS(state: State, elevators: Elevator[]) {
		state.elevators = [...elevators];
	},
	UPDATE_ELEVATOR(state: State, updatedElevator: Elevator) {
		state.elevators.forEach((elevator) => {
			if (elevator.id == updatedElevator.id) elevator = { ...updatedElevator };
		});
	},
};

// Define the actions
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
};

// Define the getters
const getters = {
	numberOfFloors: (state: State) => state.numberOfFloors,
	numberOfElevators: (state: State) => state.numberOfElevators,
	elevators: (state: State) => state.elevators,
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

// Create the store
const storeOptions: StoreOptions<State> = {
	state,
	mutations,
	actions,
	getters,
};

function findNearestElevator(passangerCurrentFloor: number, passangerDestinationFloor: number) {
	return nearestAvailableElevatorFor(passangerCurrentFloor, passangerDestinationFloor, state.elevators);
}

export const store = createStore<State>(storeOptions);
