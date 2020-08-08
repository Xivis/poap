import React from 'react';

export const SecondaryButton: React.FC<{
  text: string;
  onClick: () => void;
}> = ({ onClick, text }) => (
  <button className="secondary_button" type="button" onClick={onClick}>
    {text}
  </button>
);
