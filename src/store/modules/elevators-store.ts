import { Elevator } from '@/classes/Elevator';
import { ElevatorState } from '../../models/ElevatorState';
import { RootState } from '@/models/RootState';
import { ActionContext, Module } from 'vuex';

const state: ElevatorState = {
	numberOfElevators: 0,
	elevators: [],
	nearestElevator: null,
	ongoingRequestsExist: false,
};

const mutations = {
	SET_NUMBER_OF_ELEVATORS(state: ElevatorState, payload: { elevators: number; numberOfFloors: number }) {
		const { elevators, numberOfFloors } = payload;
		state.numberOfElevators = elevators;
		state.elevators = [];
		state.elevators = Array.from({ length: elevators }, (_, id) => {
			const floorHeight = 50;
			const x = id * 60;
			const y = floorHeight * numberOfFloors + numberOfFloors - 1;
			return new Elevator(id, { x, y: y - 50 });
		});
	},
	RESET_ELEVATORS(state: ElevatorState): void {
		state.elevators = [];
	},
	RESET_STATE(state: ElevatorState): void {
		state.numberOfElevators = 0;
		state.elevators = [];
		state.nearestElevator = null;
		state.ongoingRequestsExist = false;
	},
	SET_ONGOING_REQUESTS_EXIST(state: ElevatorState, value: boolean): void {
		state.ongoingRequestsExist = value;
	},
	CALL_ELEVATOR(state: ElevatorState, payload: { currentFloor: number; destinationFloor: number }): { currentFloor: number; destinationFloor: number } {
		return payload;
	},
	UPDATE_NEAREST_ELEVATOR_PROPERTIES(state: ElevatorState, payload: Partial<Elevator>): void {
		if (state.nearestElevator) {
			Object.assign(state.nearestElevator, payload);
		}
	},
	UPDATE_ELEVATORS(state: ElevatorState, elevators: Elevator[]): void {
		state.elevators = [...elevators];
	},
	UPDATE_ELEVATOR(state: ElevatorState, updatedElevator: Elevator): void {
		state.elevators.forEach((elevator: Elevator) => {
			if (elevator.id == updatedElevator.id) elevator = { ...updatedElevator };
		});
	},
};

const actions = {
	updateNumberOfElevators({ commit, rootState }: ActionContext<ElevatorState, RootState>, elevators: number) {
		const numberOfFloors = rootState.floorsStore.numberOfFloors;
		commit('SET_NUMBER_OF_ELEVATORS', { elevators, numberOfFloors });
	},
	updateElevator({ commit }: { commit: any }, elevator: Elevator) {
		commit('UPDATE_ELEVATOR', elevator);
	},
	updateElevators({ commit }: { commit: any }, elevators: Elevator[]) {
		commit('UPDATE_ELEVATORS', elevators);
	},
	updateNearestElevator({ commit }: { commit: any }, elevator: Elevator) {
		commit('SET_NEAREST_ELEVATOR', elevator);
	},
	updateNearestElevatorProperties({ commit }: { commit: any }, payload: Partial<Elevator>) {
		commit('UPDATE_NEAREST_ELEVATOR_PROPERTIES', payload);
	},
	callElevator({ commit, dispatch }: { commit: any; dispatch: any }, payload: { currentFloor: number; destinationFloor: number }) {
		commit('CALL_ELEVATOR', payload);
	},
	setOnogingRequestsExist({ commit }: { commit: any }, value: boolean) {
		commit('SET_ONGOING_REQUESTS_EXIST', value);
	},
	resetElevators({ commit }: { commit: any }) {
		commit('RESET_ELEVATORS');
	},
	resetState({ commit }: { commit: any }) {
		commit('RESET_STATE');
	},
};

const getters = {
	numberOfElevators: (state: ElevatorState) => state.numberOfElevators,
	elevators: (state: ElevatorState) => state.elevators,
	nearestElevator: (state: ElevatorState) => state.nearestElevator,
	ongoingRequestsExist: (state: ElevatorState) => state.ongoingRequestsExist,
};

export const elevatorsStore: Module<ElevatorState, RootState> = {
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
};
