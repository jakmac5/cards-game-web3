<template>
	<div class="stats">
		<div class="row">Cards in deck: {{ state.remaining }}</div>
		<div class="row">Turns left: {{ state.roundsLeft }}</div>
		<div class="row">Points: {{ state.pointsFixed }}</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import type { ComputedRef } from "vue";
	import type { State } from "../store";
	import { useStore } from "vuex";

	const store = useStore();
	const state: ComputedRef<State> = computed(() => store.state);
</script>

<style scoped lang="scss">
	.stats {
		position: fixed;
		top: 3%;
		right: 3%;
		.row {
			@apply text-white;
			font-size: 2rem;
		}
	}
</style>
