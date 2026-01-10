import React from "react";
import { Stack } from "../types";
import Card from "./Card";

interface FoundationProps {
	foundations: [Stack, Stack, Stack, Stack];
	onFoundationClick: (index: number) => void;
}

export default function Foundation({
	foundations,
	onFoundationClick,
}: FoundationProps) {
	return (
		<div className="foundations">
			{foundations.map((foundation, index) => (
				<div
					key={index}
					className="foundation-pile"
					onClick={() => onFoundationClick(index)}
				>
					{foundation.length === 0 ? (
						<div className="card-placeholder foundation-placeholder"></div>
					) : (
						<Card card={foundation[foundation.length - 1]} />
					)}
				</div>
			))}
		</div>
	);
}
