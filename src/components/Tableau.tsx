import React from "react";
import { Stack, Card as CardType } from "../types";
import Card from "./Card";

interface TableauProps {
	stacks: Stack[];
	selectedCards: CardType[];
	onCardClick: (colIndex: number, cardIndex: number) => void;
	onEmptyClick: (colIndex: number) => void;
}

export default function Tableau({
	stacks,
	selectedCards,
	onCardClick,
	onEmptyClick,
}: TableauProps) {
	const isSelected = (card: CardType) => {
		return selectedCards.some((c) => c.id === card.id);
	};

	return (
		<div className="tableau">
			{stacks.map((stack, colIndex) => (
				<div key={colIndex} className="tableau-column">
					{stack.length === 0 ? (
						<div
							className="card-placeholder"
							onClick={() => onEmptyClick(colIndex)}
						></div>
					) : (
						stack.map((card, cardIndex) => (
							<Card
								key={card.id}
								card={card}
								onClick={() => onCardClick(colIndex, cardIndex)}
								selected={isSelected(card)}
								style={{
									position: "absolute",
									top: `${cardIndex * 25}px`,
								}}
							/>
						))
					)}
				</div>
			))}
		</div>
	);
}
