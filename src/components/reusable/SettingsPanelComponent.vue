<template>
	<div>
		<form v-if="panelType == 'form'" :id="formId" @submit.prevent="handleSubmit">
			<div class="content">
				<h2>{{ title }}</h2>
				<p class="warning-message">{{ warningMessage }}</p>
				<slot></slot>
			</div>
			<button :class="buttonClass">{{ buttonText }}</button>
		</form>
	</div>
</template>

<script>
export default {
	props: {
		formId: String,
		title: String,
		warningMessage: String,
		buttonClass: String,
		buttonText: String,
		handleSubmit: Function,
		panelType: String,
	},
};
</script>

<style scoped>
.settings-panel form {
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

.settings-panel form h2 {
	margin-bottom: 5px;
}

.settings-panel form button {
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

.settings-panel form button:hover {
	opacity: 0.8;
}
.settings-panel form button:active {
	opacity: 1;
}

.settings-panel .warning-message {
	color: #d63031;
	font-size: 11px;
	font-weight: bold;
	margin-top: 0;
	height: 25px;
}
.settings-panel #random-calls-section .warning-message {
	height: 14px;
}
#random-calls-section .content {
	margin-bottom: 1.2em;
}
#random-calls-section button.random-calls-button {
	background-color: var(--elevator-random-call-color);
}
</style>
