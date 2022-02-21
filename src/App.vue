<template>
	<h1 v-if="roundsLeft != 0" class="header">Guess next card!</h1>
	<h3 v-if="!start && state && roundsLeft != 0" class="header">
		Reload the previous game?
	</h3>
	<div class="nav" v-if="roundsLeft != 0">
		<VButton v-if="!start && !state" @click="startGame()" color="green"
			>Start new game</VButton
		>
		<VButton v-if="!start && state" @click="loadPrevGame()" color="green"
			>Yes</VButton
		>
		<VButton v-if="!start && state" @click="startGame()" color="red"
			>No</VButton
		>
	</div>
	<div v-if="start && card && roundsLeft != 0" class="game">
		<img alt="card" :src="card.image" />
		{{ card.value }}
		<Stats />
		<div class="nav">
			<VButton color="green" @click="bet('high')">HIGHER</VButton>
			<VButton color="red" @click="bet('low')">LOWER</VButton>
		</div>
	</div>
	<div v-if="roundsLeft === 0" class="end">
		<h1 class="header">
			Congratulations! You have earned {{ points }} points!
		</h1>
		<VButton @click="startGame()" color="green">Start new game</VButton>
	</div>
	History: <br />
	{{ history }}
</template>

<script lang="ts">
	import { defineComponent } from "vue";
	import { useStore } from "vuex";
	import { computed } from "vue";

	// TODO move to other file
	export interface Card {
		image: string;
		value: string;
		code: string;
		suit: string;
	}
	export interface Event {
		round: number;
		prev: string;
		current: string;
		win: boolean;
		bet: string;
	}
	export interface State {
		deckId: string;
		remaining: number;
		points: number;
		prevCard: Card | undefined;
		card: Card | undefined;
		pointsFixed: string;
		roundsLeft: number;
		history: Array<Event>;
	}

	export default defineComponent({
		data() {
			return {
				dataReady: false,
				start: false,
				state: {} as State,
			};
		},
		beforeMount() {
			let state = localStorage.getItem("state");
			console.log("state", state);
			state != null ? (this.state = JSON.parse(state)) : "";
		},
		methods: {
			async startGame() {
				await this.store.dispatch("initDeck");
				this.start = true;
				// await this.store.dispatch("drawCard");
			},
			loadPrevGame() {
				this.store.dispatch("storePrevGame", this.state);
				this.start = true;
			},
			bet(type: string) {
				this.store.dispatch("playCard", type);
			},
		},
		setup() {
			const store = useStore();
			return {
				store,
				card: computed(() => store.state.card),
				history: computed(() => store.state.history),
				roundsLeft: computed(() => store.state.roundsLeft),
				points: computed(() => store.state.pointsFixed),
			};
		},
	});
</script>

<style lang="scss">
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		background-color: #1a1a1a;
		width: 100%;
		height: 100%;
		@apply flex flex-col justify-center items-center;
	}

	body,
	html {
		width: 100%;
		height: 100%;
		font-family: Helvetica, sans-serif;
	}
	.header {
		@apply text-white font-bold;
		margin-bottom: 60px;
		font-size: 4em;
	}

	.nav {
		@apply flex gap-4 mt-12;
	}
	.end {
		@apply flex flex-col justify-center items-center mb-6;
	}
	.game {
		@apply flex flex-col justify-center items-center;
		.card {
			padding-bottom: 40px;
		}
	}
</style>
