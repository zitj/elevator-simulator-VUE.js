import { RandomCallsState } from '@/models/RandomCallState';
import { RootState } from '@/models/RootState';
import { ActionContext, Module } from 'vuex';

const state: RandomCallsState = {
	randomButtonInnerText: 'Start',
	randomPassengerCurrentFloor: '-',
	randomPassengerDestinationFloor: '-',
	timerDOM: 0,
	callElevatorRandomly: false,
};

const mutations = {
	TOGGLE_CALL_ELEVATOR_RANDOMLY(state: RandomCallsState, value: boolean): void {
		state.callElevatorRandomly = value;
		if (!state.callElevatorRandomly) mutations.RESET_STATE(state);
	},
	SET_TIMER_DOM(state: RandomCallsState, currentTime: number): void {
		state.timerDOM = currentTime;
	},
	SET_RANDOM_FLOORS_TO_DISPLAY(state: RandomCallsState, payload: { randomCurrentFloor: string; randomDestinationFloor: string }): void {
		const { randomCurrentFloor, randomDestinationFloor } = payload;
		state.randomPassengerCurrentFloor = randomCurrentFloor;
		state.randomPassengerDestinationFloor = randomDestinationFloor;
	},
	RESET_STATE(state: RandomCallsState): void {
		state.randomButtonInnerText = state.callElevatorRandomly ? 'Stop' : 'Start';
		state.randomPassengerCurrentFloor = '-';
		state.randomPassengerDestinationFloor = '-';
		state.timerDOM = 0;
	},
};

const actions = {
	setCallElevatorRandomly({ commit }: { commit: any }, value: boolean) {
		commit('TOGGLE_CALL_ELEVATOR_RANDOMLY', value);
	},
	setTimerDOM({ commit }: ActionContext<RandomCallsState, RootState>, currentTime: number) {
		commit('SET_TIMER_DOM', currentTime);
	},
	displayRandomFloors({ commit }: ActionContext<RandomCallsState, RootState>, payload: { randomCurrentFloor: string; randomDestinationFloor: string }) {
		commit('SET_RANDOM_FLOORS_TO_DISPLAY', payload);
	},
	resetState({ commit }: { commit: any }) {
		commit('RESET_STATE');
	},
};
const getters = {
	randomButtonInnerText: (state: RandomCallsState) => state.randomButtonInnerText,
	randomPassengerCurrentFloor: (state: RandomCallsState) => state.randomPassengerCurrentFloor,
	randomPassengerDestinationFloor: (state: RandomCallsState) => state.randomPassengerDestinationFloor,
	// warningMessageCall: (state: RandomCallsState) => state.warningMessageCall,
	timerDOM: (state: RandomCallsState) => state.timerDOM,
	callElevatorRandomly: (state: RandomCallsState) => state.callElevatorRandomly,
};

export const randomCallsStore: Module<RandomCallsState, RootState> = {
	namespaced: true,
	state,
	getters,
	mutations,
	actions,
};
