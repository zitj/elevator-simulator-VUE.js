import { RandomPassengerFunctions } from '../models/functions/RandomPassengerFunctions';
import { store } from '../store/index';
import { computed } from 'vue';

export function useRandomPassengers(): RandomPassengerFunctions {
	const floors = computed(() => {
		return store.getters['floorsStore/floors'];
	});
	const callElevatorRandomly = computed(() => {
		return store.getters['randomCallsStore/callElevatorRandomly'];
	});

	const setTimerDOM = (currentTime: number) => store.dispatch('randomCallsStore/setTimerDOM', currentTime);
	const displayRandomFloors = (payload: { randomCurrentFloor: string; randomDestinationFloor: string }) => store.dispatch('randomCallsStore/displayRandomFloors', payload);

	let timerIntervals: number[] = [];

	const showRandomPassenger = (findNearestElevator: any): void => {
		clearRandomCallsTimers();

		let time = 5;
		const timerCounter = setInterval(() => {
			time--;
			if (time < 0) time = 4;
			if (!callElevatorRandomly.value) {
				time = 0;
				clearRandomCallsTimers();
			}
			setTimerDOM(time);
		}, 1000);

		timerIntervals.push(timerCounter);
		const timer = setInterval(() => {
			if (callElevatorRandomly.value) {
				const randomCurrentFloor = Math.floor(Math.random() * floors.value.length);
				let randomDestinationFloor = Math.floor(Math.random() * floors.value.length);
				while (randomCurrentFloor === randomDestinationFloor) {
					randomDestinationFloor = Math.floor(Math.random() * floors.value.length);
				}
				if (randomCurrentFloor !== randomDestinationFloor) {
					const payload = { randomCurrentFloor: randomCurrentFloor.toString(), randomDestinationFloor: randomDestinationFloor.toString() };
					displayRandomFloors(payload);
					findNearestElevator(randomCurrentFloor, randomDestinationFloor, true);
				}
			} else {
				clearRandomCallsTimers();
			}
		}, 5000);

		timerIntervals.push(timer);
	};
	const clearRandomCallsTimers = (): void => {
		timerIntervals.forEach((timer) => clearInterval(timer));
		timerIntervals = [];
	};
	return { showRandomPassenger, clearRandomCallsTimers };
}
