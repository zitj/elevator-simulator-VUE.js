<template>
	<div class="input-field">
		<label :for="id">{{ label }}</label>
		<input :value="modelValue" :id="id" :type="type" :name="name" :min="min" @input="$emit('update:modelValue', $event.target.value)" required />
	</div>
</template>

<script>
export default {
	props: {
		label: String,
		modelValue: [String, Number],
		id: String,
		type: {
			type: String,
			default: 'number',
		},
		name: String,
		min: {
			type: Number,
			default: 0,
		},
	},
};
</script>

<style scoped>
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
</style>
