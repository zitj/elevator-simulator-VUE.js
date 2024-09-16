import { Elevator } from '@/classes/Elevator';
import { Passenger } from '@/classes/Passenger';
import { STATUS } from '@/constants/status';
import { PassengerState } from '@/models/PassengerState';
import { RootState } from '@/models/RootState';
import { ActionContext, Module } from 'vuex';

const state: PassengerState = {
	passengers: [],
	passengersCurrentFloorCall: 0,
	passengersDestinationFloorCall: 0,
};

const mutations = {
	SET_PASSENGERS_CURRENT_FLOOR_CALL(state: PassengerState, passengersCurrentFloorCall: number): void {
		state.passengersCurrentFloorCall = passengersCurrentFloorCall;
	},
	SET_PASSENGERS_DESTINATION_FLOOR_CALL(state: PassengerState, passengersDestinationFloorCall: number): void {
		state.passengersDestinationFloorCall = passengersDestinationFloorCall;
	},
	ADD_NEW_PASSENGER(state: PassengerState, payload: { currentFloorNumber: number; destinationFloorNumber: number; nearestElevator: Elevator; elevators: Elevator[] }): void {
		const { currentFloorNumber, nearestElevator, elevators } = payload;
		const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const passanger = new Passenger(uniqueId, currentFloorNumber, nearestElevator.id, state.passengersDestinationFloorCall);
		passanger.position = { left: nearestElevator.coordinates.x + 10, top: nearestElevator.coordinates.y };
		state.passengers.push(passanger);
		elevators.forEach((elevator) => {
			if (elevator.id === nearestElevator.id) {
				if (elevator.passengerThatCalledFirst === null) elevator.passengerThatCalledFirst = passanger;
				elevator.passengersToPickUp.push(passanger);
			}
		});
	},
	PICK_UP_PASSENGER(state: PassengerState, payload: { nearestElevator: Elevator; elevators: Elevator[] }): void {
		const { nearestElevator, elevators } = payload;
		elevators.forEach((elevator: Elevator) => {
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
	DROP_PASSANGER(state: PassengerState, payload: { nearestElevator: Elevator; elevators: Elevator[] }): void {
		const { nearestElevator, elevators } = payload;
		elevators.forEach((elevator: Elevator) => {
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
		state.passengers = state.passengers.filter((passenger) => passenger.status !== STATUS.DROPPED);
	},
	RESET_PASSENGERS(state: PassengerState): void {
		state.passengers = [];
	},
	RESET_STATE(state: PassengerState): void {
		state.passengers = [];
		state.passengersCurrentFloorCall = 0;
		state.passengersDestinationFloorCall = 0;
	},
};

const actions = {
	updatePassengersCurrentFloorCall({ commit }: { commit: any }, passengersCurrentFloorCall: number) {
		commit('SET_PASSENGERS_CURRENT_FLOOR_CALL', passengersCurrentFloorCall);
	},
	updatePassengersDestinationFloorCall({ commit }: { commit: any }, passengersDestinationFloorCall: number) {
		commit('SET_PASSENGERS_DESTINATION_FLOOR_CALL', passengersDestinationFloorCall);
	},
	passengerShowsUp(
		{ commit, rootState }: ActionContext<PassengerState, any>,
		details: { currentFloorNumber: number; destinationFloorNumber: number; nearestElevator: Elevator; elevators: Elevator[] }
	) {
		const elevators = rootState.elevatorsStore.elevators;
		details.elevators = elevators;
		commit('ADD_NEW_PASSENGER', details);
	},
	pickUpPassenger({ commit, rootState }: ActionContext<PassengerState, RootState>, nearestElevator: Elevator) {
		const elevators = rootState.elevatorsStore.elevators;
		const payload = { nearestElevator, elevators };
		commit('PICK_UP_PASSENGER', payload);
	},
	dropPassangerOnDestinationFloor({ commit, rootState }: ActionContext<PassengerState, RootState>, nearestElevator: Elevator) {
		const elevators = rootState.elevatorsStore.elevators;
		const payload = { nearestElevator, elevators };
		commit('DROP_PASSANGER', payload);
	},
	resetPassengers({ commit }: { commit: any }) {
		commit('RESET_PASSENGERS');
	},
	resetState({ commit }: { commit: any }) {
		commit('RESET_STATE');
	},
};

const getters = {
	passengers: (state: PassengerState) => state.passengers,
	passengersCurrentFloorCall: (state: PassengerState) => state.passengersCurrentFloorCall,
	passengersDestinationFloorCall: (state: PassengerState) => state.passengersDestinationFloorCall,
};

export const passengersStore: Module<PassengerState, RootState> = {
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
};
