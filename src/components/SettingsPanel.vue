<template>
	<div class="settings-panel">
		<form id="create-building-form" @submit.prevent="createBuilding">
			<div class="content">
				<h2>Create Building</h2>
				<p class="warning-message">{{ warningMessageCreate }}</p>
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
		<form v-show="buildingCreated" id="call-elevator-form" @submit.prevent="handleCallElevator">
			<div class="content">
				<h2>Call Elevator</h2>
				<p class="warning-message">{{ warningMessageCall }}</p>
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
		<section v-show="buildingCreated" id="random-calls-section">
			<div class="content">
				<h2>Random calls</h2>
				<p class="warning-message"></p>
				<div class="timer">
					<span class="text">Next call starts in:</span>
					<span class="number">{{ timerDOM }}</span>
				</div>
				<div class="current-floor">
					<span class="text">Random current floor:</span>
					<span class="number">{{ randomPassengerCurrentFloor }}</span>
				</div>
				<div class="destination-floor">
					<span class="text">Random destination floor:</span>
					<span class="number">{{ randomPassengerDestinationFloor }}</span>
				</div>
			</div>
			<button id="random-calls-button" @click="startRandomCalls">{{ randomButtonInnerText }}</button>
		</section>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapGetters } from 'vuex';
import { Elevator } from '../classes/Elevator';
import { Passenger } from '../classes/Passenger';
import { STATUS } from '../constants/status';
import { nearestAvailableElevatorFor } from '../services/nearest-elevator-service';
import { MESSAGES } from '../constants/messages';

export default defineComponent({
	name: 'SettingsPanel',
	data() {
		return {
			numberOfFloors: 0,
			numberOfElevators: 0,
			passengersCurrentFloorCall: 0,
			passengersDestinationFloorCall: 0,
			buildingCreated: false,
			callElevatorRandomly: false,
			timerIntervals: [] as number[],
			timeouts: [] as number[],
			timerDOM: 0,
			randomButtonInnerText: 'Start',
			randomPassengerCurrentFloor: '-',
			randomPassengerDestinationFloor: '-',
			movementInterval: 700,
			warningMessageCreate: `${MESSAGES.BETTER_USER_EXPERIENCE}`,
			warningMessageCall: '',
		};
	},
	computed: {
		...mapGetters(['elevators', 'floors']),
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
			'passengerShowsUp',
			'pickUpPassenger',
			'dropPassangerOnDestinationFloor',
			'resetGeneralState',
			'resetPassengers',
		]),
		createBuilding(): void {
			if (this.numberOfFloors < 1 || this.numberOfElevators < 1) {
				this.warningMessageCreate = MESSAGES.GREATER_THAN_ZERO;
				return;
			}
			this.resetRandomSection();
			this.clearAllTimers();
			this.resetGeneralState();
			this.updateNumberOfFloors(this.numberOfFloors + 1);
			this.updateNumberOfElevators(this.numberOfElevators);
			if (this.numberOfElevators > 0 && this.numberOfFloors > 0) {
				this.warningMessageCreate = '';
				this.warningMessageCall = '';
				this.buildingCreated = true;
				this.numberOfFloors = 0;
				this.numberOfElevators = 0;
				this.passengersCurrentFloorCall = 0;
				this.passengersDestinationFloorCall = 0;
			}
		},
		clearAllTimers(): void {
			this.timerIntervals.forEach((timer) => clearInterval(timer));
			this.timeouts.forEach((timeout) => clearTimeout(timeout));
			this.timerIntervals = [];
			this.timeouts = [];
		},
		reinitiateBuilding(numberOfFloors: number, numberOfElevators: number): void {
			if (numberOfFloors < 1 || numberOfElevators < 1) {
				this.warningMessageCreate = MESSAGES.GREATER_THAN_ZERO;
				return;
			}
			this.randomButtonInnerText = 'Stop';
			this.clearAllTimers();
			this.resetGeneralState();
			this.updateNumberOfFloors(numberOfFloors);
			this.updateNumberOfElevators(numberOfElevators);
			if (numberOfElevators > 0 && numberOfFloors > 0) {
				this.warningMessageCreate = '';
				this.warningMessageCall = '';
				this.buildingCreated = true;
				this.numberOfFloors = 0;
				this.numberOfElevators = 0;
				this.passengersCurrentFloorCall = 0;
				this.passengersDestinationFloorCall = 0;
			}
		},

		checkIfThereArePassangersWaitingOnThisFloor(elevator: Elevator): void {
			const currentFloor = elevator.currentFloorInMotion ? elevator.currentFloorInMotion : elevator.currentFloor;
			elevator.passengersToPickUp.forEach((passanger, index) => {
				if (passanger.waitingOnFloorNumber == currentFloor) {
					this.stopMoving(elevator);
					let timeout = setTimeout(() => {
						clearTimeout(timeout);
						elevator.status = STATUS.READY;
						this.pickUpPassenger(elevator);
						this.startMoving(elevator);
					}, this.movementInterval);
					this.timeouts.push(timeout);
				}
			});
		},

		checkIfThereArePassengersToDropOnThisFloor(elevator: Elevator): void {
			elevator.pickedUpPassengers.forEach((passenger) => {
				if (passenger.destinationFloor == elevator.currentFloorInMotion) {
					this.stopMoving(elevator);
					let timeout = setTimeout(() => {
						clearTimeout(timeout);
						elevator.status = STATUS.READY;
						this.dropPassangerOnDestinationFloor(elevator);
						this.startMoving(elevator);
					}, this.movementInterval);
					this.timeouts.push(timeout);
				}
			});
		},
		moveToNextFloor(elevator: Elevator): void {
			if (elevator.status === STATUS.MOVING_UP && elevator.currentFloorInMotion < this.floors.length - 1) {
				++elevator.currentFloorInMotion;
				elevator.coordinates.y = elevator.coordinates.y - 50 - 1;
			}
			if (elevator.status === STATUS.MOVING_DOWN && elevator.currentFloorInMotion > 0) {
				--elevator.currentFloorInMotion;
				elevator.coordinates.y = elevator.coordinates.y + 50 + 1;
			}
			this.checkIfThereArePassangersWaitingOnThisFloor(elevator);
			this.checkIfThereArePassengersToDropOnThisFloor(elevator);
		},

		returnHighestFloorOfPassangersToPickUp(passangers: Passenger[]): number | null {
			if (passangers && passangers.length > 0) {
				return passangers.sort((a, b) => b.waitingOnFloorNumber - a.waitingOnFloorNumber)[0].waitingOnFloorNumber;
			} else {
				return null;
			}
		},
		returnDestinationFloorToLeave(elevator: Elevator): number | null {
			const passangers = elevator.pickedUpPassengers;
			const passangersWaiting: boolean = elevator.passengersToPickUp && elevator.passengersToPickUp.length > 0 ? true : false;

			if (passangers && passangers.length > 0 && !passangersWaiting) {
				if (elevator.status === STATUS.MOVING_DOWN) return passangers.sort((a, b) => a.destinationFloor - b.destinationFloor)[0].destinationFloor;
				if (elevator.status === STATUS.MOVING_UP) return passangers.sort((a, b) => b.destinationFloor - a.destinationFloor)[0].destinationFloor;
				if (elevator.status === STATUS.READY) {
					return passangers.sort((a, b) => a.destinationFloor - b.destinationFloor)[0].destinationFloor;
				}
			}
			return null;
		},

		moveElevator(elevator: Elevator): void {
			if (elevator.status === STATUS.READY) this.pickUpPassenger(elevator);
			let highestDestinationFloor = this.returnHighestFloorOfPassangersToPickUp(elevator.passengersToPickUp);
			let destinationFloor: number | null = this.returnDestinationFloorToLeave(elevator);
			if (highestDestinationFloor !== null) elevator.destinationFloor = Math.abs(highestDestinationFloor);
			if (destinationFloor !== null && highestDestinationFloor == null) elevator.destinationFloor = Math.abs(destinationFloor);
			const distance = elevator.currentFloorInMotion - elevator.destinationFloor;
			if (distance == 0 && elevator.passengersToPickUp.length == 0 && elevator.pickedUpPassengers.length == 0) elevator.status = STATUS.IDLE;
			if (distance == 0 && (elevator.passengersToPickUp.length !== 0 || elevator.pickedUpPassengers.length !== 0)) {
				this.stopMoving(elevator);
				elevator.status = STATUS.READY;
				this.startMoving(elevator);
			}

			if (distance > 0) elevator.status = STATUS.MOVING_DOWN;
			if (distance < 0) elevator.status = STATUS.MOVING_UP;
			const buildingHeight = 50 * (this.floors.length - 1) + (this.floors.length - 1);
			if (elevator.coordinates.y + 50 + 1 > buildingHeight && elevator.status == STATUS.MOVING_DOWN && elevator.currentFloorInMotion > 0) {
				elevator.currentFloorInMotion = 0;
				elevator.status = STATUS.MOVING_UP;
			}

			if (elevator.status == STATUS.IDLE && elevator.currentFloorInMotion == elevator.destinationFloor) {
				elevator.currentFloor = elevator.destinationFloor;
				elevator.passengerThatCalledFirst = null;
				this.stopMoving(elevator);
			}

			if (elevator.currentFloorInMotion !== elevator.destinationFloor) {
				if (elevator.status === STATUS.MOVING_UP || elevator.status === STATUS.MOVING_DOWN) this.moveToNextFloor(elevator);
			}
		},
		stopMoving(elevator: Elevator): void {
			if (elevator.interval !== null) {
				elevator.isPaused = true;
				clearInterval(elevator.interval);
				elevator.interval = null;
				this.updateNearestElevatorProperties({ interval: elevator.interval });
			}
		},
		startMoving(elevator: Elevator): void {
			elevator.isPaused = false;
			if (elevator.interval === null || elevator.interval === undefined) {
				elevator.interval = setInterval(() => {
					this.moveElevator(elevator);
				}, this.movementInterval);
				this.updateNearestElevatorProperties({ interval: elevator.interval });
				this.timerIntervals.push(elevator.interval);
			}
		},
		goToDesiredFloor(elevator: Elevator): void {
			if (elevator.passengersToPickUp && elevator.passengersToPickUp.length > 0) {
				elevator.currentFloorInMotion = elevator.currentFloorInMotion ? elevator.currentFloorInMotion : elevator.currentFloor;
				if (this.passengersCurrentFloorCall == elevator.currentFloorInMotion) {
					elevator.destinationFloor = this.passengersDestinationFloorCall;
					elevator.status = STATUS.READY;
				}
				if (this.passengersCurrentFloorCall !== elevator.currentFloorInMotion) {
					elevator.destinationFloor = this.passengersCurrentFloorCall;
					elevator.passengersDestinationFloor = this.passengersDestinationFloorCall;
				}
				this.startMoving(elevator);
				this.updateElevator(elevator);
			}
		},

		findNearestElevator(passengerCurrentFloor: number, passengerDestinationFloor: number, isRandomCall?: boolean): void {
			if (passengerCurrentFloor == passengerDestinationFloor) {
				this.warningMessageCall = MESSAGES.SAME_FLOOR;
				return;
			}
			if (passengerCurrentFloor >= this.floors.length || passengerDestinationFloor >= this.floors.length) {
				this.warningMessageCall = MESSAGES.MAX_FLOOR_NUMBER.replace('{0}', this.floors.length);
				return;
			}

			const nearestElevator = nearestAvailableElevatorFor(passengerCurrentFloor, passengerDestinationFloor, this.elevators);
			if (nearestElevator) {
				this.warningMessageCall = '';
				nearestElevator.isRandomlyCalled = isRandomCall ? true : false;
				this.updatePassengersCurrentFloorCall(passengerCurrentFloor);
				this.updatePassengersDestinationFloorCall(passengerDestinationFloor);
				this.passengerShowsUp({ currentFloorNumber: passengerCurrentFloor, destinationFloorNumber: passengerDestinationFloor, nearestElevator });
				this.goToDesiredFloor(nearestElevator);
			}
		},

		handleCallElevator(): void {
			this.callElevator({
				currentFloor: this.passengersCurrentFloorCall,
				destinationFloor: this.passengersDestinationFloorCall,
			});
			this.findNearestElevator(this.passengersCurrentFloorCall, this.passengersDestinationFloorCall);
		},

		resetRandomSection(): void {
			this.callElevatorRandomly = false;
			this.randomPassengerCurrentFloor = '-';
			this.randomPassengerDestinationFloor = '-';
			this.randomButtonInnerText = 'Start';
			this.timerDOM = 0;
		},
		passengersShowUpRandomly(): void {
			let time = 5;
			let timerCounter = setInterval(() => {
				time--;
				if (time < 0) time = 4;
				if (!this.callElevatorRandomly) {
					time = 0;
					clearInterval(timerCounter);
					clearInterval(timer);
				}
				this.timerDOM = time;
			}, 1000);

			this.timerIntervals.push(timerCounter);

			let timer = setInterval(() => {
				time = 0;
				if (this.callElevatorRandomly) {
					let randomCurrentFloor = Math.floor(Math.random() * this.floors.length);
					let randomDestinationFloor = Math.floor(Math.random() * this.floors.length);
					while (randomCurrentFloor === randomDestinationFloor) {
						randomDestinationFloor = Math.floor(Math.random() * this.floors.length);
					}
					if (randomCurrentFloor !== randomDestinationFloor) {
						this.randomPassengerCurrentFloor = randomCurrentFloor.toString();
						this.randomPassengerDestinationFloor = randomDestinationFloor.toString();
						this.findNearestElevator(randomCurrentFloor, randomDestinationFloor, true);
					}
				} else {
					clearInterval(timerCounter);
					clearInterval(timer);
				}
			}, 5000);
			this.timerIntervals.push(timer);
		},
		startRandomCalls() {
			this.callElevatorRandomly = !this.callElevatorRandomly;
			if (this.callElevatorRandomly) {
				this.reinitiateBuilding(this.floors.length, this.elevators.length);
				this.passengersShowUpRandomly();
			} else {
				this.resetRandomSection();
			}
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
