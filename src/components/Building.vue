<template>
	<div>
		<div id="building" v-if="numberOfFloors > 0 && numberOfElevators > 0">
			<div id="floors">
				<div v-for="(floor, index) in numberOfFloors" :key="index" :id="`${index}`" class="floor">
					<span class="floor-number">{{ floor > 1 ? floor - 1 : 'Ground floor' }}</span>
					<div class="passangers">
						<PassengerComponent :floorId="index"></PassengerComponent>
					</div>
				</div>
				<div id="elevators"></div>
				<div id="elevators">
					<div
						v-for="(elevator, index) in elevators"
						:key="index"
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
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import PassengerComponent from './PassengerComponent.vue';
import { Elevator } from '../classes/Elevator';
import { Floor } from '../classes/Floor';
import { STATUS } from '../constants/status';
import { SYMBOLS } from '../constants/symbols';

export default defineComponent({
	name: 'BuildingComponent',
	components: { PassengerComponent },

	computed: {
		...mapGetters(['numberOfFloors', 'numberOfElevators', 'elevators', 'floors', 'passengersCurrentFloorCall', 'passengersDestinationFloorCall', 'latestElevatorCall', 'nearestElevator']),
		...mapState(['nearestElevator']),
	},

	methods: {
		...mapActions(['updateNearestElevator', 'updateNearestElevatorProperties', 'resetElevators', 'updateElevators', 'updateElevator']),

		returnPassangerInElevatorSymbol(): string {
			return SYMBOLS.HEAD;
		},

		returnDestinationFloorNumber(elevator: Elevator): string | undefined {
			if (elevator.status == STATUS.IDLE) return ``;
			if (elevator.status === STATUS.READY) return `${elevator.currentFloorInMotion}`;
			if (elevator.status !== STATUS.IDLE) return `${elevator.destinationFloor}`;
		},
		returnStatusSymbol(status: string): string | undefined {
			if (status === STATUS.MOVING_DOWN) return SYMBOLS.ARROW_DOWN;
			if (status === STATUS.MOVING_UP) return SYMBOLS.ARROW_UP;
			if (status === STATUS.READY) return SYMBOLS.READY;
		},
		getElevatorStyle(elevator: Elevator) {
			return {
				left: `${elevator.coordinates.x}px`,
				top: `${elevator.coordinates.y}px`,
				width: '40px',
				marginLeft: '20px',
				opacity: elevator.status !== STATUS.IDLE && elevator.status !== STATUS.READY ? 0.75 : 1,
			};
		},

		addDOMElementTo(selector: string, arrayOfObjects: Elevator[] | Floor[]): void {
			const domElements: HTMLElement = document.querySelector(`#${selector}s`) as HTMLElement;
			if (domElements) {
				domElements.childNodes.forEach((node: Node) => {
					const domElement = node as HTMLElement;
					if (domElement !== undefined && domElement.classList && domElement.classList.contains(`${selector}`)) {
						const object: Elevator | Floor = arrayOfObjects[Number(domElement.id)];
						if (object) {
							object.domElement = domElement;
						}
					}
				});
			}
		},
	},
	watch: {
		elevators: {
			handler(newValue): void {
				let elevators = toRaw(newValue);
				if (elevators && !elevators[0].domElement) {
					this.$nextTick(() => {
						this.addDOMElementTo('elevator', elevators);
					});
				}
			},
			deep: true,
		},
		floors: {
			handler(newValue): void {
				let floors = toRaw(newValue);
				this.$nextTick(() => {
					this.addDOMElementTo('floor', floors);
				});
			},
			deep: true,
		},
	},
});
</script>

<style scoped>
#building {
	position: relative;
	width: 50%;
	height: 80%;
	background: rgb(214, 214, 214);
	border-radius: 3px;
	margin: 0 auto;
}

#floors {
	display: flex;
	width: 100%;
	flex-direction: column-reverse;
}

#floors .floor {
	width: 100%;
	height: 50px;
	background: #bcdeff;
	background: linear-gradient(to right, #74b9ff, #bcdeff);
	border-top: 1px solid #0984e3;
	border-left: 1px solid #0984e3;
	border-right: 1px solid #0984e3;
	text-align: right;
	position: relative;
}
#floors .floor:first-child {
	background: #b2bec3;
	background: linear-gradient(to bottom, #b2bec3, rgb(148, 148, 148));
	border-left: 1px solid #2d343670;
	border-right: 1px solid #2d343670;
	margin-bottom: 0;
	border-bottom: none;
}

#floors .floor span {
	font-weight: bold;
	margin-right: 1em;
	font-size: 2em;
}

#floors .floor span.floor-number {
	opacity: 0.1;
}
#floors .floor span.passanger {
	width: 50px;
	left: 0;
	position: absolute;
	z-index: 2;
}
#floors .floor .words {
	font-size: 10px;
	position: absolute;
	left: -30px;
	width: 80px;
	text-align: center;
	background: rgba(255, 255, 255, 0.4);
	z-index: 1;
	padding: 1px 3px;
}
#floors .floor .icon {
	font-size: 25px;
	z-index: 222222;
}
#floors .floor .passangers {
	height: 100%;
	width: 100%;
	position: absolute;
	left: 0;
	top: 0;
}

#elevators .elevator {
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
#elevators .elevator span {
	color: white;
	line-height: 50px;
	font-weight: bold;
	font-size: 20px;
	z-index: 1;
	opacity: 0.6;
}
#elevators .elevator span.arrow {
	color: var(--elevator-arrow-color);
}

#elevators .elevator.active {
	background-color: var(--elevator-regular-call-color);
	opacity: 0.75;
}
#elevators .elevator.pause {
	opacity: 1;
}
#elevators .elevator.active-random,
#elevators .elevator.active-random.pause {
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
