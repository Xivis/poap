import React from 'react';
import classNames from 'classnames';
export const SubmitButton: React.FC<{
  text: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onClick?: () => void;
}> = ({ isSubmitting, canSubmit, text, onClick = () => null }) => (
  <button
    className={classNames('btn', isSubmitting && 'loading')}
    type="submit"
    disabled={isSubmitting || !canSubmit}
    onClick={onClick}
  >
    {isSubmitting ? '' : text}
  </button>
);
