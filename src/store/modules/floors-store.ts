import { Floor } from '@/classes/Floor';
import { FloorsState } from '@/models/FloorState';
import { RootState } from '@/models/RootState';
import { Module } from 'vuex';

const state: FloorsState = {
	numberOfFloors: 0,
	floors: [],
};

const mutations = {
	SET_NUMBER_OF_FLOORS(state: FloorsState, floorsNumber: number) {
		state.numberOfFloors = floorsNumber;
		state.floors = Array.from({ length: floorsNumber }, (_, id) => {
			return new Floor(id);
		});
	},
	RESET_ELEVATORS(state: FloorsState): void {
		state.floors = [];
	},
	RESET_STATE(state: FloorsState): void {
		state.numberOfFloors = 0;
		state.floors = [];
	},
};

const actions = {
	updateNumberOfFloors({ commit }: { commit: any }, floors: number) {
		commit('SET_NUMBER_OF_FLOORS', floors);
	},
	resetState({ commit }: { commit: any }) {
		commit('RESET_STATE');
	},
};

const getters = {
	numberOfFloors: (state: FloorsState) => {
		return state.numberOfFloors;
	},
	floors: (state: FloorsState) => state.floors,
};

export const floorsStore: Module<FloorsState, RootState> = {
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
};
