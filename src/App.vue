<template>
	<div id="metamask">
		<button v-if="metamaskSupport" @click="connectWallet()">
			Metamask Login
		</button>
		<h2 v-else>Install metamask plugin</h2>
		<button v-if="metamaskSupport" @click="saveScore()">
			Wykonaj kontrakt
		</button>
		<button v-if="metamaskSupport" @click="retrieveScores()">
			Pobierz wyniki
		</button>
		{{ allScores }}
	</div>
	<h1 v-if="roundsLeft != 0" class="header">Guess next card!</h1>
	<h3
		v-if="!start && Object.keys(state).length > 0 && roundsLeft != 0"
		class="header"
	>
		Reload the previous game?
	</h3>
	<div class="nav" v-if="roundsLeft != 0">
		<VButton
			v-if="!start && Object.keys(state).length === 0"
			@click="startGame()"
			color="green"
			>Start new game</VButton
		>
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
	<div class="history">
		{{ history }}
	</div>
</template>

<script lang="ts">
	// import VueMetamask from "vue-metamask";
	import GameRanking from "./ABI/GameRanking.json";
	import { defineComponent, ref } from "vue";
	import { useStore } from "vuex";
	import { computed } from "vue";
	import { ethers } from "ethers";

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

	interface Score {
		from: string;
		datetime: Date;
		points: number;
		name: string;
	}
	export default defineComponent({
		// components: {
		// 	VueMetamask,
		// },
		data() {
			return {
				dataReady: false,
				start: false,
				state: {} as State,
				metamaskSupport: false,
				data: [],
			};
		},
		mounted() {
			if (typeof (window as any).ethereum !== "undefined") {
				this.metamaskSupport = true;
			}
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
			async connectWallet() {
				this.data = await (window as any).ethereum.request({
					method: "eth_requestAccounts",
				});
				console.log("address: ", this.data[0]);
				this.retrieveScores();
			},
			// onComplete(data: any) {
			// 	// change type
			// 	console.log("data:", data);
			// },
		},
		setup() {
			const store = useStore();
			const contractAddress = "0xd5a423B8CF5b6097aCC243c18d738934fE09235f"; // address to env
			const allScores = ref<Score[]>([]);

			const retrieveScores = async function () {
				allScores.value = [];

				//@ts-expect-error Window.ethers not TS

				if (typeof window.ethereum !== "undefined") {
					//@ts-expect-error Window.ethers not TS

					const provider = new ethers.providers.Web3Provider(window.ethereum);
					// const provider = new ethers.providers.AlchemyProvider(
					// 	"homestead",
					// 	"Ym9pJEN95QI7l4T6knGpa7-P6hFh6vyZ"
					// );
					// const provider = new ethers.providers.JsonRpcProvider(
					// 	"https://eth-rinkeby.alchemyapi.io/v2/Ym9pJEN95QI7l4T6knGpa7-P6hFh6vyZ"
					// );
					// Contract reference
					const contract = new ethers.Contract(
						contractAddress,
						GameRanking.abi,
						provider
					);
					try {
						// test total
						// const total = await contract.getTotalScores({});
						// allScores.value.push = total;
						// console.log("total:", allScores.value);

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
			};

			const saveScore = async function () {
				//@ts-expect-error Window.ethers not TS
				if (typeof window.ethereum !== "undefined") {
					// trxInProgress.value = true;
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
						// message.value = "";
						// trxInProgress.value = false;

						console.log("transaction proceed, waiting to retrieveScores");
						await retrieveScores();
						console.log("got scores:", allScores.value);
					} catch (error) {
						console.error(error);
						// trxInProgress.value = false;
					}
				}
			};

			return {
				saveScore,
				retrieveScores,
				allScores,
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
