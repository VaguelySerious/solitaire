import { Card, Stack, GameState } from './types';

export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];
  let id = 0;

  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ id: id++, value, suit, faceUp: false });
    }
  }

  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function initializeGame(): GameState {
  const deck = createDeck();
  const tableau: GameState['tableau'] = [[], [], [], [], [], [], []];

  // Deal cards to tableau
  let deckIndex = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[deckIndex++];
      card.faceUp = row === col; // Only top card face up
      tableau[col].push(card);
    }
  }

  // Remaining cards go to deck
  const remainingDeck = deck.slice(deckIndex).map(card => ({ ...card, faceUp: false }));

  return {
    deck: remainingDeck,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    selectedCards: [],
    selectedFrom: null,
    moves: 0,
    time: 0,
  };
}

export function isRed(suit: Card['suit']): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function canPlaceOnTableau(card: Card, targetStack: Stack): boolean {
  if (targetStack.length === 0) {
    return card.value === 13; // Only King on empty tableau
  }

  const topCard = targetStack[targetStack.length - 1];
  return (
    topCard.faceUp &&
    topCard.value === card.value + 1 &&
    isRed(topCard.suit) !== isRed(card.suit)
  );
}

export function canPlaceOnFoundation(card: Card, foundation: Stack): boolean {
  if (foundation.length === 0) {
    return card.value === 1; // Only Ace on empty foundation
  }

  const topCard = foundation[foundation.length - 1];
  return topCard.suit === card.suit && topCard.value === card.value - 1;
}

export function drawFromDeck(state: GameState): GameState {
  if (state.deck.length === 0) {
    // Reset deck from waste
    return {
      ...state,
      deck: [...state.waste].reverse().map(card => ({ ...card, faceUp: false })),
      waste: [],
    };
  }

  const newDeck = [...state.deck];
  const drawnCards = newDeck.splice(0, Math.min(3, newDeck.length));
  drawnCards.forEach(card => (card.faceUp = true));

  return {
    ...state,
    deck: newDeck,
    waste: [...state.waste, ...drawnCards],
    moves: state.moves + 1,
  };
}

export function checkWin(state: GameState): boolean {
  return state.foundations.every(foundation => foundation.length === 13);
}

export function autoComplete(state: GameState): GameState {
  let newState = { ...state };
  let moved = true;

  while (moved) {
    moved = false;

    // Try to move from waste
    if (newState.waste.length > 0) {
      const card = newState.waste[newState.waste.length - 1];
      for (let i = 0; i < 4; i++) {
        if (canPlaceOnFoundation(card, newState.foundations[i])) {
          const newWaste = [...newState.waste];
          newWaste.pop();
          const newFoundations = [...newState.foundations] as GameState['foundations'];
          newFoundations[i] = [...newFoundations[i], card];
          newState = {
            ...newState,
            waste: newWaste,
            foundations: newFoundations,
            moves: newState.moves + 1,
          };
          moved = true;
          break;
        }
      }
    }

    // Try to move from tableau
    if (!moved) {
      for (let col = 0; col < 7; col++) {
        const tableau = newState.tableau[col];
        if (tableau.length > 0) {
          const card = tableau[tableau.length - 1];
          if (card.faceUp) {
            for (let i = 0; i < 4; i++) {
              if (canPlaceOnFoundation(card, newState.foundations[i])) {
                const newTableau = [...newState.tableau] as GameState['tableau'];
                newTableau[col] = [...tableau];
                newTableau[col].pop();
                
                // Flip next card if exists
                if (newTableau[col].length > 0) {
                  const lastCard = newTableau[col][newTableau[col].length - 1];
                  if (!lastCard.faceUp) {
                    lastCard.faceUp = true;
                  }
                }

                const newFoundations = [...newState.foundations] as GameState['foundations'];
                newFoundations[i] = [...newFoundations[i], card];
                newState = {
                  ...newState,
                  tableau: newTableau,
                  foundations: newFoundations,
                  moves: newState.moves + 1,
                };
                moved = true;
                break;
              }
            }
            if (moved) break;
          }
        }
      }
    }
  }

  return newState;
}

