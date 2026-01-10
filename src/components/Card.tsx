import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  style?: React.CSSProperties;
  selected?: boolean;
}

export default function Card({ card, onClick, style, selected }: CardProps) {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const valueNames: Record<number, string> = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  const displayValue = valueNames[card.value] || card.value.toString();
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  if (!card.faceUp) {
    return (
      <div
        className={`card facedown ${selected ? 'selected' : ''}`}
        onClick={onClick}
        style={style}
      >
        <div className="card-back"></div>
      </div>
    );
  }

  return (
    <div
      className={`card ${isRed ? 'red' : 'black'} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={style}
    >
      <div className="card-value">{displayValue}</div>
      <div className="card-suit">{suitSymbols[card.suit]}</div>
      <div className="card-value-bottom">{displayValue}</div>
    </div>
  );
}

