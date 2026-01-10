export interface Card {
	id: number;
	value: number; // 1-13 (Ace-King)
	suit: "hearts" | "diamonds" | "clubs" | "spades";
	faceUp: boolean;
}

export type Stack = Card[];

export interface GameState {
	deck: Stack;
	waste: Stack;
	foundations: [Stack, Stack, Stack, Stack];
	tableau: [Stack, Stack, Stack, Stack, Stack, Stack, Stack];
	selectedCards: Card[];
	selectedFrom: number | null;
	moves: number;
	time: number;
}
