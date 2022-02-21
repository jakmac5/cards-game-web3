<template>
	<div class="stats">
		<div class="row">Cards in deck: {{ cardsRemaining }}</div>
		<div class="row">Turns left: {{ roundsLeft }}</div>
		<div class="row">Points: {{ points }}</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue";
	import { useStore } from "vuex";
	import { computed } from "vue";
	export default defineComponent({
		setup() {
			const store = useStore();
			return {
				cardsRemaining: computed(() => store.state.remaining),
				points: computed(() => store.state.pointsFixed),
				roundsLeft: computed(() => store.state.roundsLeft),
			};
		},
	});
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
