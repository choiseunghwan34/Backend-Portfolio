import React from 'react';

export default function Card({ title, value, hint }) {
  return (
    <section className="stat-card">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value}</div>
      {hint ? <div className="stat-card__hint">{hint}</div> : null}
    </section>
  );
}
