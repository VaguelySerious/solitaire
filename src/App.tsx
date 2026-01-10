import React, { useState, useEffect } from "react";
import { GameState, Card as CardType } from "./types";
import {
	initializeGame,
	drawFromDeck,
	canPlaceOnTableau,
	canPlaceOnFoundation,
	checkWin,
	autoComplete,
} from "./gameLogic";
import DeckAndWaste from "./components/DeckAndWaste";
import Foundation from "./components/Foundation";
import Tableau from "./components/Tableau";

function App() {
	const [gameState, setGameState] = useState<GameState>(initializeGame());
	const [gameWon, setGameWon] = useState(false);
	const [showWin, setShowWin] = useState(false);

	useEffect(() => {
		// Timer
		const interval = setInterval(() => {
			setGameState((prev) => ({ ...prev, time: prev.time + 1 }));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (checkWin(gameState)) {
			setGameWon(true);
			setShowWin(true);
		}
	}, [gameState]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const handleNewGame = () => {
		setGameState(initializeGame());
		setGameWon(false);
		setShowWin(false);
	};

	const handleDeckClick = () => {
		setGameState(drawFromDeck(gameState));
	};

	const handleWasteClick = () => {
		if (gameState.waste.length === 0) return;

		const card = gameState.waste[gameState.waste.length - 1];
		setGameState({
			...gameState,
			selectedCards: [card],
			selectedFrom: -1, // -1 indicates waste
		});
	};

	const handleFoundationClick = (foundationIndex: number) => {
		if (gameState.selectedCards.length === 0) return;
		if (gameState.selectedCards.length > 1) return; // Can only move one card to foundation

		const card = gameState.selectedCards[0];
		const foundation = gameState.foundations[foundationIndex];

		if (canPlaceOnFoundation(card, foundation)) {
			const newState = { ...gameState };
			const newFoundations = [
				...newState.foundations,
			] as GameState["foundations"];
			newFoundations[foundationIndex] = [...foundation, card];

			if (newState.selectedFrom === -1) {
				// From waste
				newState.waste = newState.waste.slice(0, -1);
			} else if (newState.selectedFrom !== null) {
				// From tableau
				const newTableau = [...newState.tableau] as GameState["tableau"];
				newTableau[newState.selectedFrom] = newTableau[
					newState.selectedFrom
				].slice(0, -1);

				// Flip next card if exists
				if (newTableau[newState.selectedFrom].length > 0) {
					const lastCard =
						newTableau[newState.selectedFrom][
							newTableau[newState.selectedFrom].length - 1
						];
					if (!lastCard.faceUp) {
						lastCard.faceUp = true;
					}
				}
				newState.tableau = newTableau;
			}

			setGameState({
				...newState,
				foundations: newFoundations,
				selectedCards: [],
				selectedFrom: null,
				moves: newState.moves + 1,
			});
		}
	};

	const handleTableauCardClick = (colIndex: number, cardIndex: number) => {
		const stack = gameState.tableau[colIndex];
		const card = stack[cardIndex];

		if (!card.faceUp) return;

		// If we have selected cards, try to place them
		if (gameState.selectedCards.length > 0) {
			const firstCard = gameState.selectedCards[0];

			// Can't place on same column
			if (gameState.selectedFrom === colIndex) {
				setGameState({
					...gameState,
					selectedCards: [],
					selectedFrom: null,
				});
				return;
			}

			if (canPlaceOnTableau(firstCard, stack)) {
				const newState = { ...gameState };
				const newTableau = [...newState.tableau] as GameState["tableau"];

				// Add cards to target
				newTableau[colIndex] = [...stack, ...newState.selectedCards];

				// Remove cards from source
				if (newState.selectedFrom === -1) {
					// From waste
					newState.waste = newState.waste.slice(0, -1);
				} else if (newState.selectedFrom !== null) {
					// From tableau
					newTableau[newState.selectedFrom] = newTableau[
						newState.selectedFrom
					].slice(0, -newState.selectedCards.length);

					// Flip next card if exists
					if (newTableau[newState.selectedFrom].length > 0) {
						const lastCard =
							newTableau[newState.selectedFrom][
								newTableau[newState.selectedFrom].length - 1
							];
						if (!lastCard.faceUp) {
							lastCard.faceUp = true;
						}
					}
				}

				setGameState({
					...newState,
					tableau: newTableau,
					selectedCards: [],
					selectedFrom: null,
					moves: newState.moves + 1,
				});
			} else {
				// Invalid move, deselect
				setGameState({
					...gameState,
					selectedCards: [],
					selectedFrom: null,
				});
			}
		} else {
			// Select cards from this position onwards
			const selectedCards = stack.slice(cardIndex);
			setGameState({
				...gameState,
				selectedCards,
				selectedFrom: colIndex,
			});
		}
	};

	const handleEmptyTableauClick = (colIndex: number) => {
		if (gameState.selectedCards.length === 0) return;

		const firstCard = gameState.selectedCards[0];

		// Only King can be placed on empty tableau
		if (firstCard.value === 13) {
			const newState = { ...gameState };
			const newTableau = [...newState.tableau] as GameState["tableau"];

			// Add cards to target
			newTableau[colIndex] = [...newState.selectedCards];

			// Remove cards from source
			if (newState.selectedFrom === -1) {
				// From waste
				newState.waste = newState.waste.slice(0, -1);
			} else if (newState.selectedFrom !== null) {
				// From tableau
				newTableau[newState.selectedFrom] = newTableau[
					newState.selectedFrom
				].slice(0, -newState.selectedCards.length);

				// Flip next card if exists
				if (newTableau[newState.selectedFrom].length > 0) {
					const lastCard =
						newTableau[newState.selectedFrom][
							newTableau[newState.selectedFrom].length - 1
						];
					if (!lastCard.faceUp) {
						lastCard.faceUp = true;
					}
				}
			}

			setGameState({
				...newState,
				tableau: newTableau,
				selectedCards: [],
				selectedFrom: null,
				moves: newState.moves + 1,
			});
		}
	};

	const handleAutoComplete = () => {
		const newState = autoComplete(gameState);
		setGameState(newState);
	};

	return (
		<div className="game">
			<div className="game-header">
				<div className="game-info">
					<div className="game-stat">Time: {formatTime(gameState.time)}</div>
					<div className="game-stat">Moves: {gameState.moves}</div>
				</div>
				<div className="game-controls">
					<button onClick={handleNewGame} className="btn">
						New Game
					</button>
					<button onClick={handleAutoComplete} className="btn">
						Auto Complete
					</button>
				</div>
			</div>

			<div className="game-board">
				<div className="game-top">
					<DeckAndWaste
						deck={gameState.deck}
						waste={gameState.waste}
						onDeckClick={handleDeckClick}
						onWasteClick={handleWasteClick}
					/>
					<Foundation
						foundations={gameState.foundations}
						onFoundationClick={handleFoundationClick}
					/>
				</div>

				<Tableau
					stacks={gameState.tableau}
					selectedCards={gameState.selectedCards}
					onCardClick={handleTableauCardClick}
					onEmptyClick={handleEmptyTableauClick}
				/>
			</div>

			{showWin && (
				<div className="win-modal">
					<div className="win-content">
						<h2>🎉 You Won! 🎉</h2>
						<p>Time: {formatTime(gameState.time)}</p>
						<p>Moves: {gameState.moves}</p>
						<button onClick={handleNewGame} className="btn btn-large">
							Play Again
						</button>
						<button onClick={() => setShowWin(false)} className="btn">
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
