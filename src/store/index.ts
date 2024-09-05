import { Elevator } from '@/models/Elevator';
import { Passenger } from '@/models/Passenger';
import { createStore, StoreOptions } from 'vuex';
import { nearestAvailableElevatorFor } from '@/services/nearest-elevator-service';

// Define the state interface
interface State {
	numberOfFloors: number;
	numberOfElevators: number;
	passengersCurrentFloorCall: number;
	passengersDestinationFloorCall: number;
	elevators: Elevator[];
	passangers: Passenger[];
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
	nearestElevator: null,
};

// Define the mutations
const mutations = {
	setNumberOfFloors(state: State, floors: number) {
		state.numberOfFloors = floors;
	},
	setNumberOfElevators(state: State, elevators: number) {
		state.numberOfElevators = elevators;
		state.elevators = Array.from({ length: elevators }, (_, id) => {
			const floorHeight = 50;
			const x = id * 60;
			const y = floorHeight * state.numberOfFloors + state.numberOfFloors - 1;
			return new Elevator(id, { x, y: y - 50 });
		});
	},

	resetAllElevators(state: State) {
		state.elevators = [];
	},

	setPassangersCurrentFloorCall(state: State, passengersCurrentFloorCall: number) {
		state.passengersCurrentFloorCall = passengersCurrentFloorCall;
	},
	setPassengersDestinationFloorCall(state: State, passengersDestinationFloorCall: number) {
		state.passengersDestinationFloorCall = passengersDestinationFloorCall;
	},
	setNearestElevator(state: State, elevator: Elevator) {
		state.nearestElevator = elevator;
	},
	CALL_ELEVATOR(state: State, payload: { currentFloor: number; destinationFloor: number }) {
		console.log('Elevator with payload:', payload);
	},
	UPDATE_NEAREST_ELEVATOR(state: State, payload: Partial<Elevator>) {
		if (state.nearestElevator) {
			Object.assign(state.nearestElevator, payload);
		}
	},
};

// Define the actions
const actions = {
	updateNumberOfFloors({ commit }: { commit: any }, floors: number) {
		commit('setNumberOfFloors', floors);
	},
	updateNumberOfElevators({ commit }: { commit: any }, elevators: number) {
		commit('setNumberOfElevators', elevators);
	},
	updatePassengersCurrentFloorCall({ commit }: { commit: any }, passengersCurrentFloorCall: number) {
		commit('setPassangersCurrentFloorCall', passengersCurrentFloorCall);
	},
	updatePassengersDestinationFloorCall({ commit }: { commit: any }, passengersDestinationFloorCall: number) {
		commit('setPassengersDestinationFloorCall', passengersDestinationFloorCall);
	},
	updateNearestElevator({ commit }: { commit: any }, elevator: Elevator) {
		commit('setNearestElevator', elevator);
	},
	callElevator({ commit, dispatch }: { commit: any; dispatch: any }, payload: { currentFloor: number; destinationFloor: number }) {
		commit('CALL_ELEVATOR', payload);
		const nearestElevator = findNearestElevator(payload.currentFloor, payload.destinationFloor);
		dispatch('updateNearestElevator', nearestElevator);
	},
	updateNearestElevatorProperties({ commit }: { commit: any }, payload: Partial<Elevator>) {
		commit('UPDATE_NEAREST_ELEVATOR', payload);
		console.log(payload);
	},
	resetElevators({ commit }: { commit: any }) {
		commit('resetAllElevators');
	},
};

// Define the getters
const getters = {
	numberOfFloors: (state: State) => state.numberOfFloors,
	numberOfElevators: (state: State) => state.numberOfElevators,
	elevators: (state: State) => state.elevators,
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
