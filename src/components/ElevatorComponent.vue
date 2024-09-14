<template>
	<div
		class="elevator"
		:class="{ active: elevator.status !== 'idle', pause: elevator.isPaused, 'active-random': elevator.isRandomlyCalled && elevator.status !== 'idle' }"
		:style="getElevatorStyle(elevator)"
		:id="`${index}`"
	>
		<span class="arrow" v-html="returnStatusSymbol(elevator.status)"></span>
		<span class="destination-floor" v-html="returnDestinationFloorNumber(elevator)"></span>
		<span class="passangers-in-elevator">
			<span v-for="passenger in elevator.pickedUpPassengers" class="passanger-in-elevator" :key="passenger.id" v-html="returnPassangerInElevatorSymbol()"></span>
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Elevator } from '../classes/Elevator';
import { STATUS } from '../constants/status';
import { SYMBOLS } from '../constants/symbols';

export default defineComponent({
	name: 'ElevatorComponent',
	props: {
		elevator: {
			type: Elevator,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	setup(props) {
		const returnDestinationFloorNumber = (elevator: Elevator): string | undefined => {
			if (elevator.status == STATUS.IDLE) return ``;
			if (elevator.status === STATUS.READY) return `${elevator.currentFloorInMotion}`;
			if (elevator.status !== STATUS.IDLE) return `${elevator.destinationFloor}`;
		};
		const returnStatusSymbol = (status: string): string | undefined => {
			if (status === STATUS.MOVING_DOWN) return SYMBOLS.ARROW_DOWN;
			if (status === STATUS.MOVING_UP) return SYMBOLS.ARROW_UP;
			if (status === STATUS.READY) return SYMBOLS.READY;
		};

		const getElevatorStyle = (elevator: Elevator) => {
			return {
				left: `${elevator.coordinates.x}px`,
				top: `${elevator.coordinates.y}px`,
				width: '40px',
				marginLeft: '20px',
				opacity: elevator.status !== STATUS.IDLE && elevator.status !== STATUS.READY ? 0.75 : 1,
			};
		};

		const returnPassangerInElevatorSymbol = (): string => {
			return SYMBOLS.HEAD;
		};

		return { returnDestinationFloorNumber, returnStatusSymbol, getElevatorStyle, returnPassangerInElevatorSymbol };
	},
});
</script>

<style scoped>
.elevator {
	width: 40px;
	height: 51px;
	background: rgb(55, 55, 55);
	background: #2d3436;
	text-align: center;
	transition: 1s;
	opacity: 1;
	z-index: 1;
	position: absolute;
}
.elevator span {
	color: white;
	line-height: 50px;
	font-weight: bold;
	font-size: 20px;
	z-index: 1;
	opacity: 0.6;
}
.elevator span.arrow {
	color: var(--elevator-arrow-color);
}

.elevator.active {
	background-color: var(--elevator-regular-call-color);
	opacity: 0.75;
}
.elevator.pause {
	opacity: 1;
}
.elevator.active-random,
.elevator.active-random.pause {
	background-color: var(--elevator-random-call-color);
}
.passangers-in-elevator {
	position: absolute;
	opacity: 1;
	z-index: 9999999;
	display: flex;
	left: -8px;
	bottom: -18px;
	transform: scale(0.7);
}

.passanger-in-elevator {
	margin-left: -12px;
}
.passanger-in-elevator:first-child {
	margin-left: 0;
}
</style>
