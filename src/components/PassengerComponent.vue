<template>
	<div>
		<div v-for="passenger in passengers" :key="passenger.id">
			<div v-if="passenger.status == 'waiting' && passenger.waitingOnFloorNumber == floorId" class="passenger" :style="{ left: `${passenger.position.left}px` }">
				<span class="icon" v-html="passengerSymbol()"></span>
				<div class="words">{{ `To floor: ${passenger.destinationFloor}` }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import { SYMBOLS } from '../constants/symbols';
export default defineComponent({
	name: 'PassengerComponent',
	props: {
		floorId: {
			type: Number,
			required: true,
		},
	},
	computed: {
		...mapGetters('passengersStore', ['passengers']),
	},
	methods: {
		passengerSymbol() {
			return SYMBOLS.PASSENGER;
		},
	},
	watch: {},
});
</script>

<style scoped>
.passenger {
	width: 40px;
	left: 0;
	position: absolute;
	z-index: 2;
	bottom: 0;
}
.words {
	font-size: 8px;
	position: absolute;
	text-align: center;
	background: rgba(255, 255, 255, 0.556);
	z-index: -1;
	font-weight: 600;
	top: -10px;
	left: 10px;
	width: 45px;
	padding: 1px 3px;
}
.icon {
	font-size: 25px;
	z-index: 222222;
}
</style>
