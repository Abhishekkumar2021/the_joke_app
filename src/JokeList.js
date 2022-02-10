import React, { Component } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";

import "./JokeList.css";
import Joke from "./Joke";

class JokeList extends Component {
	static defaultProps = {
		numJokes: 10,
	};
	constructor(props) {
		super(props);
		this.state = {
			jokes: JSON.parse(localStorage.getItem("jokes")) || [],
			loading: false,
		};
		this.handleVote = this.handleVote.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.handleAdd = this.handleAdd.bind(this);
		this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
	}
	async addJokes() {
		try {
			let jokes = [];
			while (jokes.length < this.props.numJokes) {
				let response = await axios.get("https://icanhazdadjoke.com/", {
					headers: { Accept: "application/json" },
				});
				if (!this.seenJokes.has(response.data.joke))
					jokes.push({ text: response.data.joke, vote: 0, id: uuid() });
				// else {
				// 	console.log("found a duplicate joke");
				// 	console.log(response.data.joke);
				// }
			}
			this.setState({ jokes: [...this.state.jokes, ...jokes], loading: false });
		} catch (error) {
			alert(error);
			this.setState({ loading: false });
		}
	}
	componentDidMount() {
		if (this.state.jokes.length === 0) {
			this.addJokes();
		}
	}
	componentDidUpdate() {
		localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
	}
	handleAdd() {
		this.setState({ loading: true }, this.addJokes);
	}
	handleClear() {
		localStorage.removeItem("jokes");
		this.setState({ jokes: [] });
	}
	handleVote(id, delta) {
		let updated = this.state.jokes.map((joke) =>
			joke.id === id ? { ...joke, vote: joke.vote + delta } : joke
		);
		this.setState({ jokes: updated });
	}

	render() {
		if (this.state.loading) {
			return (
				<div className='spinner'>
					<i className='far fa-8x fa-laugh fa-spin' />
					<h1 className='loading'>Loading...</h1>
				</div>
			);
		}
		let jokes = this.state.jokes.sort((a, b) => b.vote - a.vote);

		return (
			<div className='JokeList'>
				<div className='JokeList-sidebar'>
					<h1>
						Dad <span className='text'>Jokes</span>
					</h1>
					<i className='far fa-laugh-wink emoji'></i>

					<button className='JokeList-btn ' onClick={this.handleAdd}>
						Get New Jokes
					</button>
					<button
						className='JokeList-btn '
						disabled={this.state.jokes.length < 4 * this.props.numJokes}
						onClick={this.handleClear}>
						Clear All
					</button>
				</div>
				<div className='JokeList-jokes'>
					{jokes.map((joke) => (
						<Joke
							joke={joke.text}
							key={joke.id}
							votes={joke.vote}
							upVote={() => this.handleVote(joke.id, 1)}
							downVote={() => this.handleVote(joke.id, -1)}
						/>
					))}
				</div>
			</div>
		);
	}
}

export default JokeList;
