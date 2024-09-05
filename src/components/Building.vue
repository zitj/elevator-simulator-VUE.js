<template>
	<div>
		<div id="building" v-if="numberOfFloors > 0 && numberOfElevators > 0">
			<div id="floors">
				<div v-for="floor in numberOfFloors" :key="floor" class="floor">
					<span class="floor-number">{{ floor > 1 ? floor - 1 : 'Ground floor' }}</span>
					<div class="passangers">
						<!-- <PassengerComponent></PassengerComponent> -->
					</div>
				</div>
				<div id="elevators">
					<div
						v-for="(elevator, index) in elevators"
						:key="index"
						class="elevator"
						:style="getElevatorStyle(elevator)"
						:class="{ active: nearestElevator && nearestElevator.id === elevator.id }"
						:id="`${index}`"
					>
						<span class="arrow"></span>
						<span class="destination-floor"></span>
						<span class="passangers-in-elevator"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { mapActions, mapGetters } from 'vuex';
import PassengerComponent from './PassengerComponent.vue';
import { Elevator } from '../models/Elevator';
// import { returnNearestAvailableElevatorFor } from '../services/nearest-elevator-service';

export default defineComponent({
	name: 'BuildingComponent',
	// components: { PassengerComponent },
	computed: {
		...mapGetters(['numberOfFloors', 'numberOfElevators', 'elevators', 'passengersCurrentFloorCall', 'passengersDestinationFloorCall', 'latestElevatorCall', 'nearestElevator']),
	},

	methods: {
		...mapActions(['updateNearestElevatorProperties']),
		getElevatorStyle(elevator: Elevator) {
			console.log(elevator);
			if (this.nearestElevator && this.nearestElevator.id === elevator.id) {
				return { left: `${elevator.coordinates.x}px`, top: `${this.nearestElevator.coordinates.y - 51}px`, marginLeft: '20px' };
			}
			return { left: `${elevator.coordinates.x}px`, top: `${elevator.coordinates.y}px`, width: '40px', marginLeft: '20px' };
		},
		updateNearestElevatorDomElement() {
			const rawNearestElevator = toRaw(this.nearestElevator);
			if (rawNearestElevator) {
				// console.log(document.querySelector('#elevators'));
				// const elevatorsElement = document.querySelector('#elevators');
				// console.log(elevatorsElement);
				// const nearestElevatorElement = elevatorsElement.find((el) => el.classList.contains(`elevator-${rawNearestElevator.id}`));
				// if (nearestElevatorElement) {
				// 	this.updateNearestElevatorProperties({ domElement: nearestElevatorElement });
				// }
			}
		},
	},
	watch: {
		nearestElevator(newValue) {
			const rawNearestElevator = toRaw(newValue);
			// this.updateNearestElevatorDomElement();
		},
		elevators: {
			handler(newValue) {
				console.log(newValue);
				let elevators = toRaw(newValue);
				this.$nextTick(() => {
					const elevatorsDOMElement = document.querySelector('#elevators');
					if (elevatorsDOMElement) {
						// Code to execute when the element is available
						elevatorsDOMElement.childNodes.forEach((child: any) => {
							if (child['id']) console.log(child['id']);
						});
					}
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
	border-bottom: 1px solid #0984e3;
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
#floors .floor:last-child {
	border-top: 1px solid #0984e3;
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
	height: 50px;
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
</style>
