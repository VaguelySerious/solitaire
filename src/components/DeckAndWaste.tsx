import React from 'react';
import { Stack } from '../types';
import Card from './Card';

interface DeckAndWasteProps {
  deck: Stack;
  waste: Stack;
  onDeckClick: () => void;
  onWasteClick: () => void;
}

export default function DeckAndWaste({
  deck,
  waste,
  onDeckClick,
  onWasteClick,
}: DeckAndWasteProps) {
  return (
    <div className="deck-waste">
      <div className="deck" onClick={onDeckClick}>
        {deck.length === 0 ? (
          <div className="card-placeholder deck-placeholder">
            <div className="reload-icon">↻</div>
          </div>
        ) : (
          <Card card={deck[0]} />
        )}
      </div>
      <div className="waste">
        {waste.length === 0 ? (
          <div className="card-placeholder"></div>
        ) : (
          <div className="waste-cards">
            {waste.slice(-3).map((card, index) => (
              <Card
                key={card.id}
                card={card}
                onClick={index === waste.slice(-3).length - 1 ? onWasteClick : undefined}
                style={{
                  position: 'absolute',
                  left: `${index * 20}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

