<template>
	<div class="settings-panel">
		<form id="create-building-form" @submit.prevent="createBuilding">
			<div class="content">
				<h2>Create Building</h2>
				<p class="warning-message"></p>
				<div class="input-field">
					<label for="number-of-floors">Number of floors:</label>
					<input v-model.number="numberOfFloors" id="generate-number-of-floors-input" type="number" name="number-of-floors" min="0" required />
				</div>
				<div class="input-field">
					<label for="number-of-elevators">Number of elevators:</label>
					<input v-model.number="numberOfElevators" id="generate-number-of-elevators-input" type="number" name="number-of-elevators" min="0" required />
				</div>
			</div>
			<button class="create-button">Create</button>
		</form>
		<form v-if="buildingCreated" id="call-elevator-form" @submit.prevent="handleCallElevator">
			<div class="content">
				<h2>Call Elevator</h2>
				<p class="warning-message"></p>
				<div class="input-field">
					<label for="current-floor">From current floor:</label>
					<input v-model.number="passengersCurrentFloorCall" id="current-floor-input" type="number" name="current-floor" min="0" required />
				</div>
				<div class="input-field">
					<label for="destination-floor">To destination floor:</label>
					<input v-model.number="passengersDestinationFloorCall" id="destination-floor-input" type="number" name="destination-floor" min="0" required />
				</div>
			</div>
			<button type="submit" class="call-button">Call</button>
		</form>
		<!-- <section v-if="buildingCreated" id="random-calls-section">
			<div class="content">
				<h2>Random calls</h2>
				<p class="warning-message"></p>
				<div class="timer">
					<span class="text">Next call starts in:</span>
					<span class="number">0</span>
				</div>
				<div class="current-floor">
					<span class="text">Random current floor:</span>
					<span class="number">-</span>
				</div>
				<div class="destination-floor">
					<span class="text">Random destination floor:</span>
					<span class="number">-</span>
				</div>
			</div>
			<button id="random-calls-button">Start</button>
		</section> -->
	</div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { mapActions, mapGetters } from 'vuex';
import { Elevator } from '../classes/Elevator';
import { STATUS } from '../constants/status';
import { nearestAvailableElevatorFor } from '../services/nearest-elevator-service';

export default defineComponent({
	name: 'SettingsPanel',
	data() {
		return {
			numberOfFloors: 0,
			numberOfElevators: 0,
			passengersCurrentFloorCall: 0,
			passengersDestinationFloorCall: 0,
			buildingCreated: false,
		};
	},
	computed: {
		...mapGetters(['elevators']),
	},

	methods: {
		...mapActions([
			'resetElevators',
			'updateNumberOfFloors',
			'updateNumberOfElevators',
			'updatePassengersCurrentFloorCall',
			'updatePassengersDestinationFloorCall',
			'callElevator',
			'updateElevator',
			'updateNearestElevatorProperties',
		]),
		createBuilding() {
			this.resetElevators();
			this.updateNumberOfFloors(this.numberOfFloors + 1);
			this.updateNumberOfElevators(this.numberOfElevators);
			if (this.numberOfElevators > 0 && this.numberOfFloors > 0) this.buildingCreated = true;
		},
		moveElevator(elevator: Elevator) {
			if (elevator.status == STATUS.IDLE && elevator.currentFloorInMotion == elevator.destinationFloor) {
				elevator.currentFloor = elevator.destinationFloor;
				this.clearElevatorInterval(elevator);
			}
			if (elevator.status !== STATUS.IDLE && elevator.currentFloorInMotion == elevator.destinationFloor) {
				elevator.isPaused = true;
				this.clearElevatorInterval(elevator);
				elevator.destinationFloor = elevator.passengersDestinationFloor;
				const distance = elevator.currentFloorInMotion - elevator.destinationFloor;
				if (distance == 0) elevator.status = STATUS.IDLE;
				if (distance > 0) elevator.status = STATUS.MOVING_DOWN;
				if (distance < 0) elevator.status = STATUS.MOVING_UP;
				let timeout = setTimeout(() => {
					elevator.isPaused = false;
					clearTimeout(timeout);
					this.startElevatorInterval(elevator);
				}, 500);
			} else {
				if (elevator.status == STATUS.MOVING_UP) {
					++elevator.currentFloorInMotion;
					elevator.coordinates.y = elevator.coordinates.y - 50 - 1;
				}
				if (elevator.status == STATUS.MOVING_DOWN) {
					--elevator.currentFloorInMotion;
					elevator.coordinates.y = elevator.coordinates.y + 50 + 1;
				}
			}
		},
		clearElevatorInterval(elevator: any) {
			if (elevator.interval !== null) {
				clearInterval(elevator.interval);
				elevator.interval = null;
				this.updateNearestElevatorProperties({ interval: elevator.interval });
			}
		},
		startElevatorInterval(elevator: any) {
			if (elevator.interval === null || elevator.interval === undefined) {
				console.log(elevator.interval);
				elevator.interval = setInterval(() => {
					this.moveElevator(elevator);
				}, 700);
				this.updateNearestElevatorProperties({ interval: elevator.interval });
			}
		},
		handleCallElevator() {
			this.updatePassengersCurrentFloorCall(this.passengersCurrentFloorCall);
			this.updatePassengersDestinationFloorCall(this.passengersDestinationFloorCall);
			this.callElevator({
				currentFloor: this.passengersCurrentFloorCall,
				destinationFloor: this.passengersDestinationFloorCall,
			});
			const nearestElevator = nearestAvailableElevatorFor(this.passengersCurrentFloorCall, this.passengersDestinationFloorCall, this.elevators);
			if (nearestElevator.currentFloor === this.passengersCurrentFloorCall) {
				nearestElevator.status = STATUS.READY;
				nearestElevator.destinationFloor = this.passengersDestinationFloorCall;
			} else {
				nearestElevator.destinationFloor = this.passengersCurrentFloorCall;
			}
			nearestElevator.currentFloorInMotion = nearestElevator.currentFloorInMotion == null ? nearestElevator.currentFloor : nearestElevator.currentFloorInMotion;
			nearestElevator.passengersCurrentFloor = this.passengersCurrentFloorCall;
			nearestElevator.passengersDestinationFloor = this.passengersDestinationFloorCall;
			this.startElevatorInterval(nearestElevator);
			let distance =
				nearestElevator.status === STATUS.READY
					? nearestElevator.passengersDestinationFloor - nearestElevator.currentFloorInMotion
					: nearestElevator.passengersCurrentFloor - nearestElevator.currentFloorInMotion;
			if (distance > 0) nearestElevator.status = STATUS.MOVING_UP;
			if (distance < 0) nearestElevator.status = STATUS.MOVING_DOWN;
			if (distance === 0) {
				nearestElevator.status = STATUS.READY;
				this.clearElevatorInterval(nearestElevator);
				nearestElevator.isPaused = true;
				let timeout = setTimeout(() => {
					nearestElevator.isPaused = false;
					clearTimeout(timeout);
					this.startElevatorInterval(nearestElevator);
				}, 500);
			}
			console.log(nearestElevator);
			this.updateElevator(nearestElevator);
		},
	},
});
</script>

<style scoped>
.settings-panel {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	box-shadow: 0px 10px 10px 0px rgba(0, 0, 0, 0.099);
	position: relative;
	height: 400px;
}
.settings-panel form,
.settings-panel section {
	width: 250px;
	padding: 0 50px 50px 50px;
	border: 1px solid #3333332e;
	border-radius: 3px;
	margin-top: 2em;
	text-align: center;
	margin-left: 2em;
	transition: 0.3s;
	transform: translateX(0px) translateY(0px) rotate(0deg);
	background-color: white;
	height: 230px;
	overflow: hidden;
}

.settings-panel form h2,
.settings-panel section h2 {
	margin-bottom: 5px;
}
.settings-panel form .input-field {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: 1.5em;
	text-align: left;
}
.settings-panel form .input-field label {
	font-size: 16px;
}
.settings-panel form .input-field input {
	width: 30%;
	font-size: 22px;
	border: none;
	border-bottom: 1px solid #3333337b;
	text-align: center;
	z-index: 10000;
}

.settings-panel form button,
.settings-panel section button {
	padding: 1em 2.5em;
	text-transform: uppercase;
	border-radius: 5px;
	border: none;
	background: #218c74;
	color: white;
	cursor: pointer;
	opacity: 1;
	text-align: center;
	margin-top: 1em;
}

.settings-panel form button.create-button {
	background-color: #2d3436;
}

.settings-panel form button:hover,
.settings-panel section button:hover {
	opacity: 0.8;
}
.settings-panel form button:active,
.settings-panel section button:active {
	opacity: 1;
}

.settings-panel .warning-message {
	color: #d63031;
	font-size: 11px;
	font-weight: bold;
	margin-top: 0;
	height: 25px;
}
.settings-panel section .warning-message {
	height: 14px;
}
#random-calls-section .content {
	margin-bottom: 1.2em;
}
#random-calls-section button#random-calls-button {
	background-color: var(--elevator-random-call-color);
}

#random-calls-section .content .number {
	font-weight: 500;
	font-size: 22px;
	margin-left: 2px;
}
</style>
