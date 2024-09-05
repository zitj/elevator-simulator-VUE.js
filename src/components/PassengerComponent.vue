<template>
	<div class="passanger">
		<span class="icon">🧍🏻‍♂️</span>
		<div class="words">{{ 'To floor: ' }}</div>
	</div>
</template>

<script>
export default {
	name: 'PassengerComponent',
	// Your component's JavaScript logic goes here
};
</script>

<style scoped>
.passanger {
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
