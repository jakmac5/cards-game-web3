import { createApp } from "vue";
import { createStore } from "vuex";
// import * as Vue from 'vue' // in Vue 3
import axios from "axios";
import VueAxios from "vue-axios";
// Create a new store instance.
export interface Card {
	image: string,
	value: string,
	code: string,
	suit: string
}
export interface Event {
	round: number,
	prev: string,
	current: string,
	win: boolean,
	bet: string
}
export interface State {
	deckId: string,
	remaining: number,
	points: number,
	prevCard: Card | undefined,
	card:  Card | undefined,
	pointsFixed: string,
	roundsLeft: number,
	history: Array<Event>
	// end: boolean
  }
export default createStore<State>({
	state: {
			deckId: '',
			remaining: 52,
			points: 0,
			roundsLeft: 31,
			pointsFixed: '0',
			prevCard: undefined,
			card: undefined,
			history: []
			// end: false
	},
	mutations: {
		initDeck(state, payload) {
			state.deckId = payload.deckId;
			state.remaining = payload.remaining;
			state.remaining = 52;
			state.points = 0;
			state.roundsLeft = 31;
			state.pointsFixed = '0';
			state.prevCard=undefined;
			state.card= undefined;
			state.history= [];
		},
		loadPrevGame(state,payload) {
			state.deckId = payload.deckId;
			state.remaining = payload.remaining;
			state.points = payload.points;
			state.roundsLeft = payload.roundsLeft;
			state.pointsFixed = payload.pointsFixed;
			state.prevCard = payload.prevCard;
			state.card = payload.card;
			state.history = payload.history;
		},
		storeCard(state,payload){
			state.roundsLeft > 0 ? state.roundsLeft -= 1 : ''
			state.remaining = payload.remaining;
			state.prevCard =payload.prevCard;
			state.card = payload.card;
		},
		addPoint(state){
			state.points += 0.1
			state.pointsFixed = state.points.toFixed(2)
		},
		addToHistory(state,payload){
			state.history.push({round: payload.round, win: payload.win, prev: payload.prev, current: payload.current, bet: payload.bet})
		}
	},
	actions: {
		storePrevGame(context,payload) {
			context.commit('loadPrevGame',payload)
		},
		initDeck(context) {
			axios
				.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
				.then((resp) => {
					if (resp.data.success) {
						context.commit("initDeck", {
							deckId: resp.data.deck_id,
							remaining: resp.data.remaining,
						});
						context.dispatch("drawCard")
					}
				});
		},
		drawCard(context) {
				axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`)
				.then((resp)=> {
					if(resp.data.success) {
						context.commit('storeCard',{prevCard: this.state.card, card:resp.data.cards[0], remaining: resp.data.remaining});
					}
				})
		},
		playCard(context, payload) {
			if(this.state.roundsLeft === 0){
				return
			}
			axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`)
			.then((resp)=> {
				if(resp.data.success) {
					context.commit('storeCard',{prevCard: this.state.card, card:resp.data.cards[0], remaining: resp.data.remaining});
					this.dispatch("checkPoints",payload)
				}
				
			})
		},
		checkPoints(context, payload) {
			// if(payload === 'high'){
				if(this.state.prevCard && this.state.card){
					const prev = this.state.prevCard.value
					const current = this.state.card.value
					let prevInt = null
					let currentInt = null
					if( isNaN(parseInt(prev))) {
						switch (prev) {
							case 'JACK':
								prevInt = 11;
								break;
							case 'QUEEN':
								prevInt = 12;
								break;
							case 'KING':
								prevInt = 13
								break;
							case 'ACE':
								prevInt = 14
								break;
						}
					} else prevInt = parseInt(prev)
					if( isNaN(parseInt(current))) {
						switch (current) {
							case 'JACK':
								currentInt = 11;
								break;
							case 'QUEEN':
								currentInt = 12;
								break;
							case 'KING':
								currentInt = 13
								break;
							case 'ACE':
								currentInt = 14
								break;
						}
					} else currentInt = parseInt(current)
					console.log('prev',prevInt,'next:',currentInt)
					let win=false;
					if(payload === 'high' && currentInt && prevInt && currentInt > prevInt) {
						context.commit('addPoint')
						win = true;
					}
					if(payload === 'low' && currentInt && prevInt && currentInt < prevInt) {
						context.commit('addPoint')
						win = true;
					}
					context.commit('addToHistory',{win:win, current:current, prev: prev, round: 30 - this.state.roundsLeft,bet:payload})
					localStorage.setItem('storedHistory', JSON.stringify(this.state.history))
					localStorage.setItem('state', JSON.stringify(this.state))
				}
			// }
		}
	},
});

// const app = createApp({
// 	/* your root component */
// });

// // Install the store instance as a plugin
// app.use(store);
