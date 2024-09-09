<template>
	<div id="general-wrapper" :class="{ 'alternative-view': (numberOfFloors > 7 && windowWidth < 1800) || numberOfFloors > 11 }">
		<BuildingComponent></BuildingComponent>
		<SettingsPanel></SettingsPanel>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import BuildingComponent from './components/Building.vue';
import SettingsPanel from './components/SettingsPanel.vue';

export default defineComponent({
	name: 'App',
	components: { SettingsPanel, BuildingComponent },
	data() {
		return {
			windowWidth: window.innerWidth,
		};
	},
	computed: {
		...mapGetters(['numberOfFloors', 'numberOfElevators']),
	},
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');
:root {
	--elevator-regular-call-color: #218c74;
	--elevator-random-call-color: #6c5ce7;
	--elevator-arrow-color: lime;
}
body {
	font-family: 'Poppins', sans-serif;
	color: #2d3436;
	background: rgba(242, 242, 242, 0.48);
}
#app {
	text-align: center;
	font-family: 'Poppins', sans-serif;
	color: #2d3436;
	background: rgba(242, 242, 242, 0.48);
}

nav {
	padding: 30px;
}

nav a {
	font-weight: bold;
	color: #2c3e50;
}

nav a.router-link-exact-active {
	color: #42b983;
}

#general-wrapper.alternative-view {
	display: flex;
}
#general-wrapper.alternative-view #building {
	margin: 0;
	width: 70%;
}
#general-wrapper.alternative-view .settings-panel {
	width: 26%;
	margin: 0 auto;
	height: 100%;
	flex-direction: column;
	z-index: 5;
	box-shadow: none;
}

#general-wrapper.alternative-view .settings-panel form,
#general-wrapper.alternative-view .settings-panel section {
	padding: 0px 10px 20px 10px;
	text-align: center;
	transition: 0.3s;
	transform: translateX(0px) translateY(0px) rotate(0deg);
	width: 100%;
	margin-top: 0;
	background-color: transparent;
	border: none;
	border-bottom: 1px solid #33333321;
	height: auto;
	margin-left: 0;
}

#general-wrapper.alternative-view .settings-panel form .input-field {
	display: flex;
	justify-content: space-between;
	align-items: start;
	text-align: left;
	margin-bottom: 10px;
	overflow: auto;
}
#general-wrapper.alternative-view .settings-panel button {
	width: 80%;
}

#general-wrapper.alternative-view .settings-panel form .content,
#general-wrapper.alternative-view .settings-panel section .content {
	text-align: left;
}
#general-wrapper.alternative-view .settings-panel .warning-message {
	height: auto;
	text-align: center;
}

#general-wrapper.alternative-view .content h2 {
	text-align: center;
}
#general-wrapper.alternative-view .settings-panel form .input-field input {
	width: 40%;
	background-color: transparent;
	border: 1px solid #33333336;
}
#general-wrapper.alternative-view .settings-panel section {
	border: none;
}
</style>
