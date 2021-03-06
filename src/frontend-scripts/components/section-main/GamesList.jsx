import React from 'react'; // eslint-disable-line
import DisplayLobbies from './DisplayLobbies.jsx';
import PropTypes from 'prop-types';
import { Checkbox } from 'semantic-ui-react';

export class GamesList extends React.Component {
	constructor() {
		super();

		this.toggleFilter = this.toggleFilter.bind(this);
		this.state = {
			filtersVisible: false
		};
	}

	toggleFilter(value) {
		const { gameFilter } = this.props;

		gameFilter[value] = !gameFilter[value];
		this.props.changeGameFilter(gameFilter);
	}

	renderFilters() {
		return (
			<div className="browser-filters ui grid">
				<div className="three wide column">
					<h4 className="ui header">Public</h4>
					<Checkbox
						toggle
						checked={this.props.gameFilter.pub}
						onChange={() => {
							this.toggleFilter('pub');
						}}
					/>
				</div>
				<div className="three wide column">
					<h4 className="ui header">Private</h4>
					<Checkbox
						toggle
						checked={this.props.gameFilter.priv}
						onChange={() => {
							this.toggleFilter('priv');
						}}
					/>
				</div>
				<div className="three wide column">
					<h4 className="ui header">Unstarted</h4>
					<Checkbox
						toggle
						checked={this.props.gameFilter.unstarted}
						onChange={() => {
							this.toggleFilter('unstarted');
						}}
					/>
				</div>
				<div className="three wide column">
					<h4 className="ui header">In progress</h4>
					<Checkbox
						toggle
						checked={this.props.gameFilter.inprogress}
						onChange={() => {
							this.toggleFilter('inprogress');
						}}
					/>
				</div>
				<div className="three wide column">
					<h4 className="ui header">Completed</h4>
					<Checkbox
						toggle
						checked={this.props.gameFilter.completed}
						onChange={() => {
							this.toggleFilter('completed');
						}}
					/>
				</div>
				<div className="three wide column iconcolumn">
					<i title="Filter by standard games" className="standard-icon" />
					<Checkbox
						toggle
						checked={this.props.gameFilter.standard}
						onChange={() => {
							this.toggleFilter('standard');
						}}
					/>
				</div>
				<div className="three wide column iconcolumn">
					<i title="Filter by experienced-player-only games" className="rainbow-icon" />
					<Checkbox
						toggle
						checked={this.props.gameFilter.rainbow}
						onChange={() => {
							this.toggleFilter('rainbow');
						}}
					/>
				</div>
			</div>
		);
	}

	renderGameList() {
		const { gameList } = this.props;

		if (gameList.length) {
			return gameList
				.filter(game => {
					const { pub, priv, unstarted, inprogress, completed, rainbow, standard } = this.props.gameFilter;

					return !(
						(game.private && !priv) ||
						(!game.private && !pub) ||
						(game.rainbowgame && !rainbow) ||
						(!game.rainbowgame && !standard) ||
						(game.gameStatus === 'notStarted' && !unstarted) ||
						(game.gameStatus === 'isStarted' && !inprogress) ||
						((game.gameStatus === 'fascist' || game.gameStatus === 'liberal') && !completed)
					);
				})
				.sort((a, b) => {
					const aGameStatus = a.gameStatus;
					const bGameStatus = b.gameStatus;
					const aName = a.name.toLowerCase();
					const bName = b.name.toLowerCase();

					if (aGameStatus === 'notStarted' && bGameStatus === 'notStarted') {
						if (a.seatedCount === b.seatedCount) {
							if (aName === bName) {
								return a.uid < b.uid ? 1 : -1;
							} else {
								return aName > bName ? 1 : -1;
							}
						} else {
							return b.seatedCount - a.seatedCount;
						}
					}

					if (aGameStatus === 'notStarted' && bGameStatus !== 'notStarted') {
						return -1;
					}

					if (aGameStatus !== 'notStated' && bGameStatus === 'notStarted') {
						return 1;
					}

					if (aGameStatus === 'isStarted' && bGameStatus !== 'isStarted') {
						return -1;
					}

					if (aGameStatus !== 'isStarted' && bGameStatus === 'isStarted') {
						return 1;
					}

					if (aGameStatus === 'isStarted' && bGameStatus === 'isStarted') {
						if (a.seatedCount === b.seatedCount) {
							if (aName === bName) {
								return a.uid < b.uid ? 1 : -1;
							} else {
								return aName > bName ? 1 : -1;
							}
						} else {
							return b.seatedCount - a.seatedCount;
						}
					}

					return aName === bName ? (a.uid < b.uid ? 1 : -1) : aName > bName ? 1 : -1;
				})
				.map((game, index) => {
					return <DisplayLobbies key={game.uid} game={game} socket={this.props.socket} userList={this.props.userList} userInfo={this.props.userInfo} />;
				});
		}
	}

	render() {
		const toggleFilter = () => {
			this.setState(state => ({
				filtersVisible: !state.filtersVisible
			}));
		};

		return (
			<section className={this.state.filtersVisible ? 'browser-container' : 'browser-container filters-hidden'}>
				<a target="_blank" href="/stats">
					<h5>100k games played!</h5>
				</a>
				<h3>Game filters</h3>
				{this.renderFilters()}
				<div className="browser-header">
					{(() => {
						const { userName } = this.props.userInfo;
						const gameBeingCreated = this.props.midSection === 'createGame';

						return userName && !gameBeingCreated ? (
							<a className="fluid ui button primary create-game-button" href="#/creategame">
								Create a new game
							</a>
						) : (
							<span className="disabled-create-game-button">
								<button className="fluid ui button primary disabled">{gameBeingCreated ? 'Creating a new game..' : 'Log in to make games'}</button>
							</span>
						);
					})()}
					<span className={this.state.filtersVisible ? 'enabled' : 'disabled'} onClick={toggleFilter}>
						<i className="very large filter icon" />Game filters
					</span>
				</div>
				<div className="browser-body">{this.renderGameList()}</div>
			</section>
		);
	}
}
GamesList.propTypes = {
	userInfo: PropTypes.object,
	midSection: PropTypes.string,
	gameList: PropTypes.array,
	socket: PropTypes.object,
	userList: PropTypes.object,
	gameFilter: PropTypes.object,
	changeGameFilter: PropTypes.func
};

export default GamesList;
