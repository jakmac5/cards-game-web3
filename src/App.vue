<template>
	<div id="metamask">
		<button v-if="metamaskSupport" @click="connectWallet()">
			Metamask Login
		</button>
		<h1 v-else>Install metamask plugin</h1>
		<button v-if="metamaskSupport" @click="saveScore()">
			Wykonaj kontrakt
		</button>
		<button v-if="metamaskSupport" @click="retrieveScores()">
			Pobierz wyniki
		</button>
		{{ allScores }}
	</div>
	<h2 v-if="state.roundsLeft != 0" class="header">Guess next card!</h2>
	<h3
		v-if="!start && Object.keys(state).length > 0 && state.roundsLeft != 0"
		class="header"
	>
		Reload the previous game?
	</h3>
	<div class="nav" v-if="state.roundsLeft != 0">
		<VButton
			v-if="!start && Object.keys(state).length === 0"
			@click="startGame()"
			color="green"
		>
			Start new game
		</VButton>
		<VButton
			v-if="!start && Object.keys(state).length > 0"
			@click="loadPrevGame()"
			color="green"
			>Yes</VButton
		>
		<VButton
			v-if="!start && Object.keys(state).length > 0"
			@click="startGame()"
			color="red"
			>No</VButton
		>
	</div>
	{{ state }}
	<div v-if="start && state.card && state.roundsLeft != 0" class="game">
		<img alt="card" :src="state.card.image" />
		{{ state.card.value }}
		<Stats />
		<div class="nav">
			<VButton color="green" @click="bet('high')"> HIGHER </VButton>
			<VButton color="red" @click="bet('low')">LOWER</VButton>
		</div>
	</div>
	<div v-if="state.roundsLeft === 0" class="end">
		<h4 class="header">
			Congratulations! You have earned {{ state.pointsFixed }} points!
		</h4>
		<VButton @click="startGame()" color="green">Start new game</VButton>
	</div>
	History: <br />
	<div class="history">
		{{ history }}
	</div>
</template>

<script setup lang="ts">
	import GameRanking from "./ABI/GameRanking.json";
	import { ref, computed, onMounted, onBeforeMount } from "vue";
	import type { Ref, ComputedRef } from "vue";
	import { useStore } from "vuex";
	import { ethers } from "ethers";
	import { Card, Event, State } from "./store";

	export interface Score {
		from: string;
		datetime: Date;
		points: number;
		name: string;
	}

	const start = ref(false);
	// const state: Ref<State> | { value: any } = ref({});
	const metamaskSupport: Ref<boolean> = ref(false);
	const data: Ref<unknown[]> = ref([]);
	const store = useStore();
	const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
	const allScores = ref<Score[]>([]);

	const state: ComputedRef<State> = computed(() => store.state);
	const history: ComputedRef<Array<Event>> = computed(
		() => store.state.history
	);

	onMounted(() => {
		if (typeof (window as any).ethereum !== "undefined") {
			metamaskSupport.value = true;
		}
		console.log("COntract address:", contractAddress);
	});
	onBeforeMount(() => {
		const getLocalState = localStorage.getItem("state");
		console.log("state", getLocalState);
		if (getLocalState !== null) {
			const obj: State = JSON.parse(getLocalState);
			store.dispatch("storePrevGame", state.value);
		}
	});

	async function startGame() {
		await store.dispatch("initDeck");
		start.value = true;
	}
	function loadPrevGame() {
		store.dispatch("storePrevGame", state.value);
		start.value = true;
	}
	function bet(type: string) {
		store.dispatch("playCard", type);
	}
	async function connectWallet() {
		data.value = await (window as any).ethereum.request({
			method: "eth_requestAccounts",
		});
		console.log("address: ", data.value[0]);
		retrieveScores();
	}

	async function retrieveScores() {
		allScores.value = [];

		//@ts-expect-error Window.ethers not TS
		if (typeof window.ethereum !== "undefined" && contractAddress) {
			//@ts-expect-error Window.ethers not TS
			const provider = new ethers.providers.Web3Provider(window.ethereum);

			// Contract reference
			const contract = new ethers.Contract(
				contractAddress,
				GameRanking.abi,
				provider
			);
			try {
				// call contract public method
				const data = await contract.getAllScores({});
				console.log("allScores :>> ", data);
				// // loops messages to format the date and add them to the array
				data.forEach((score: any) => {
					allScores.value.push({
						from: score.from,
						datetime: new Date(score.datetime * 1000),
						points: score.points,
						name: score.name,
					});
				});
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function saveScore() {
		//@ts-expect-error Window.ethers not TS
		if (typeof window.ethereum !== "undefined") {
			//@ts-expect-error Window.ethers not TS
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			// get the account that will pay for the trasaction
			const signer = provider.getSigner();
			// as the operation we're going to do is a transaction,
			// we pass the signer instead of the provider
			const contract = new ethers.Contract(
				contractAddress,
				GameRanking.abi,
				signer
			);
			try {
				const transaction = await contract.saveScore(1, "test", {
					gasLimit: 300000,
				});

				console.log("transaction :>> ", transaction);
				// wait for the transaction to actually settle in the blockchain
				await transaction.wait();

				console.log("transaction proceed, waiting to retrieveScores");
				await retrieveScores();
				console.log("got scores:", allScores.value);
			} catch (error) {
				console.error(error);
				// trxInProgress.value = false;
			}
		}
	}
</script>

<style lang="scss">
	#app {
		@apply flex flex-col justify-center items-center;
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		background-color: #1a1a1a;
		width: 100%;
		height: 100%;
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
	.history {
		width: 100%;
		height: 400px;
		margin-bottom: 100px;
		overflow-y: auto;
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
