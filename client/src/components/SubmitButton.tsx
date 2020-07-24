import React from 'react';
import classNames from 'classnames';
export const SubmitButton: React.FC<{
  text: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ isSubmitting, canSubmit, text, className, onClick = () => null }) => (
  <button
    className={classNames('btn', isSubmitting && 'loading', className && `${className}`)}
    type="submit"
    disabled={isSubmitting || !canSubmit}
    onClick={onClick}
  >
    {isSubmitting ? '' : text}
  </button>
);
