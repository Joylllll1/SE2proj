import React from 'react';
import Icon from './Icon';

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <section className="grid place-items-center rounded-md border border-dashed border-[#d0d5dd] bg-white p-12 text-center text-text-2">
      <Icon name="inventory_2" />
      <h3 className="mt-3 mb-1.5">{title}</h3>
      <p className="m-0">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="primary-button mt-4 px-5 py-2 text-sm"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default EmptyState;