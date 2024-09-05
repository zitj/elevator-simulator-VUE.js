<template>
	<div id="general-wrapper">
		<BuildingComponent></BuildingComponent>
		<SettingsPanel></SettingsPanel>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BuildingComponent from './components/Building.vue';
import SettingsPanel from './components/SettingsPanel.vue';

export default defineComponent({
	name: 'App',
	components: { SettingsPanel, BuildingComponent },
});
</script>

<style>
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
</style>
