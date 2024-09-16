<template>
	<div class="settings-panel">
		<SettingsPanelComponent
			:warningMessage="warningMessageCreate"
			:panelType="'form'"
			:handleSubmit="createBuilding"
			formId="create-building-form"
			title="Create Building"
			buttonClass="create-button"
			buttonText="Create"
		>
			<InputComponent label="Number of floors:" v-model.number="inputs.numberOfFloors" id="generate-number-of-floors-input" name="number-of-floors" type="number" />
			<InputComponent label="Number of elevators:" v-model.number="inputs.numberOfElevators" id="generate-number-of-elevators-input" name="number-of-elevators" type="number" />
		</SettingsPanelComponent>

		<SettingsPanelComponent
			:warningMessage="warningMessageCall"
			:panelType="'form'"
			:handleSubmit="handleCallElevator"
			v-show="buildingCreated"
			formId="call-elevator-form"
			title="Call Elevator"
			buttonClass="call-button"
			buttonText="Call"
		>
			<InputComponent label="From current floor:" v-model="inputs.passengersCurrentFloorCall" id="current-floor-input" name="current-floor" type="number" />
			<InputComponent label="To destination floor:" v-model="inputs.passengersDestinationFloorCall" id="destination-floor-input" name="destination-floor" type="number" />
		</SettingsPanelComponent>

		<SettingsPanelComponent
			:buttonText="randomButtonInnerText"
			:warningMessage="warningMessageCall"
			:handleSubmit="startRandomCalls"
			:panelType="'form'"
			v-show="buildingCreated"
			formId="random-calls-section"
			title="Random calls"
			buttonClass="random-calls-button"
		>
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
		</SettingsPanelComponent>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapGetters } from 'vuex';
import { Elevator } from '../classes/Elevator';
import { STATUS } from '../constants/status';
import { nearestAvailableElevatorFor } from '../services/nearest-elevator-service';
import { MESSAGES } from '../constants/messages';
import { useElevator } from '../composables/useElevator';
import SettingsPanelComponent from './reusable/SettingsPanelComponent.vue';
import InputComponent from './reusable/InputComponent.vue';

export default defineComponent({
	name: 'SettingsPanel',
	components: { SettingsPanelComponent, InputComponent },
	data() {
		return {
			inputs: {
				numberOfFloors: 0,
				numberOfElevators: 0,
				passengersCurrentFloorCall: 0,
				passengersDestinationFloorCall: 0,
			},
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
		...mapGetters('floorsStore', ['numberOfFloors', 'floors']),
		...mapGetters('elevatorsStore', ['numberOfElevators', 'elevators', 'ongoingRequestsExist']),
		...mapGetters('passengersStore', ['passengers', 'passengersCurrentFloorCall', 'passengersDestinationFloorCall']),
	},

	methods: {
		...mapActions('floorsStore', ['updateNumberOfFloors']),
		...mapActions('elevatorsStore', ['updateNumberOfElevators', 'updateElevator', 'callElevator', 'updateNearestElevatorProperties', 'setOnogingRequestsExist']),
		...mapActions('passengersStore', ['updatePassengersCurrentFloorCall', 'updatePassengersDestinationFloorCall', 'passengerShowsUp']),
		...mapActions(['resetGeneralState']),

		clearAllTimers(): void {
			const { clearElevatorTimers } = useElevator();
			clearElevatorTimers();
			this.timerIntervals.forEach((timer) => clearInterval(timer));
			this.timeouts.forEach((timeout) => clearTimeout(timeout));
			this.timerIntervals = [];
			this.timeouts = [];
		},

		createBuilding(): void {
			if (this.inputs.numberOfFloors < 1 || this.inputs.numberOfElevators < 1) {
				this.warningMessageCreate = MESSAGES.GREATER_THAN_ZERO;
				return;
			}
			this.resetRandomSection();
			this.clearAllTimers();
			this.resetGeneralState();

			this.updateNumberOfFloors(this.inputs.numberOfFloors + 1);
			this.updateNumberOfElevators(this.inputs.numberOfElevators);
			if (this.inputs.numberOfElevators > 0 && this.inputs.numberOfFloors > 0) {
				this.warningMessageCreate = '';
				this.warningMessageCall = '';
				this.buildingCreated = true;
				this.inputs.numberOfFloors = 0;
				this.inputs.numberOfElevators = 0;
				this.inputs.passengersCurrentFloorCall = 0;
				this.inputs.passengersDestinationFloorCall = 0;
			}
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
				this.inputs.numberOfFloors = 0;
				this.inputs.numberOfElevators = 0;
				this.inputs.passengersCurrentFloorCall = 0;
				this.inputs.passengersDestinationFloorCall = 0;
			}
		},

		goToDesiredFloor(elevator: Elevator): void {
			const { startMoving } = useElevator();
			if (elevator.passengersToPickUp && elevator.passengersToPickUp.length > 0) {
				elevator.currentFloorInMotion = elevator.currentFloorInMotion ? elevator.currentFloorInMotion : elevator.currentFloor;
				if (this.inputs.passengersCurrentFloorCall == elevator.currentFloorInMotion) {
					elevator.destinationFloor = this.inputs.passengersDestinationFloorCall;
					elevator.status = STATUS.READY;
				}
				if (this.inputs.passengersCurrentFloorCall !== elevator.currentFloorInMotion) {
					elevator.destinationFloor = this.inputs.passengersCurrentFloorCall;
					elevator.passengersDestinationFloor = this.inputs.passengersDestinationFloorCall;
				}

				startMoving(elevator);
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
				this.setOnogingRequestsExist(true);
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
				currentFloor: this.inputs.passengersCurrentFloorCall,
				destinationFloor: this.inputs.passengersDestinationFloorCall,
			});
			this.findNearestElevator(this.inputs.passengersCurrentFloorCall, this.inputs.passengersDestinationFloorCall);
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

#random-calls-section .content .number {
	font-weight: 500;
	font-size: 22px;
	margin-left: 2px;
}
</style>
