<template>
	<a
		:class="[
			'button',
			color === 'green' ? 'bg-green-700' : '',
			color === 'red' ? 'bg-red-700' : '',
		]"
		><slot></slot
	></a>
</template>

<script lang="ts">
	import { defineComponent } from "vue";

	export default defineComponent({
		props: {
			color: String,
		},
		setup() {
			return {};
		},
	});
</script>

<style scoped lang="scss">
	.button {
		@apply flex justify-center items-center rounded-full text-white font-bold cursor-pointer;
		width: 200px;
		height: 60px;
		&:hover {
			@apply scale-105;
		}
		&:active {
			@apply scale-95;
		}
	}
</style>
