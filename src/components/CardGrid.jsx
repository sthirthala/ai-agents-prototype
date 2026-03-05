import Card from './Card';

export default function CardGrid({ items, type, onCardClick, selectedId }) {
  return (
    <section className="card-grid">
      {items.map((item) => (
        <Card
          key={item.id}
          item={item}
          type={type}
          onClick={onCardClick}
          isSelected={item.id === selectedId}
        />
      ))}
      {items.length === 0 && (
        <div className="list-empty">No items match your filters.</div>
      )}
    </section>
  );
}
