<template>
	<div id="building" v-if="numberOfFloors > 0 && numberOfElevators > 0">
		<div id="floors">
			<div v-for="(floor, index) in numberOfFloors" :key="index" :id="`${index}`" class="floor">
				<span class="floor-number">{{ floor > 1 ? floor - 1 : 'Ground floor' }}</span>
				<div class="passangers">
					<PassengerComponent :floorId="index"></PassengerComponent>
				</div>
			</div>
			<div id="elevators">
				<ElevatorComponent v-for="(elevator, index) in elevators" :elevator="elevator" :index="index" :key="index"></ElevatorComponent>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { mapGetters } from 'vuex';
import PassengerComponent from './PassengerComponent.vue';
import { Elevator } from '../classes/Elevator';
import { Floor } from '../classes/Floor';
import ElevatorComponent from './ElevatorComponent.vue';

export default defineComponent({
	name: 'BuildingComponent',
	components: { PassengerComponent, ElevatorComponent },

	computed: {
		...mapGetters('floorsStore', ['numberOfFloors', 'floors']),
		...mapGetters('elevatorsStore', ['numberOfElevators', 'elevators', 'ongoingRequestsExist']),
	},

	methods: {
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
</style>
