import React from 'react';
import { Link } from 'react-router-dom';

const EMOJI_MAP = {
  indian: '🍛', italian: '🍝', chinese: '🍜', mexican: '🌮',
  american: '🍔', mediterranean: '🥙', japanese: '🍱', default: '🍽'
};

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(s => (
        <i key={s} className={`bi ${s <= Math.round(rating) ? 'bi-star-fill star' : 'bi-star star empty'}`}
          style={{ fontSize: '0.75rem' }}></i>
      ))}
      <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>({rating?.toFixed(1) || '0.0'})</span>
    </span>
  );
}

export default function RecipeCard({ recipe, onSaveToggle }) {
  const emoji = EMOJI_MAP[(recipe.cuisineType || '').toLowerCase()] || EMOJI_MAP.default;

  return (
    <div className="recipe-card h-100">
      {recipe.imageUrl
        ? <img src={recipe.imageUrl} alt={recipe.title} className="card-img-top" />
        : <div className="card-img-placeholder">{emoji}</div>
      }
      <div className="p-3 d-flex flex-column h-100">
        <div className="d-flex gap-2 mb-2 flex-wrap">
          {recipe.dietType && <span className="badge-diet">{recipe.dietType}</span>}
          {recipe.difficulty && <span className="badge-diff">{recipe.difficulty}</span>}
        </div>

        <h6 className="fw-700 mb-1" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', lineHeight: 1.3 }}>
          {recipe.title}
        </h6>
        <p className="text-muted mb-2" style={{ fontSize: '0.82rem', lineHeight: 1.4, flexGrow: 1 }}>
          {recipe.description?.slice(0, 80)}{recipe.description?.length > 80 ? '...' : ''}
        </p>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <StarRating rating={recipe.averageRating} />
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
            <i className="bi bi-clock me-1"></i>{recipe.cookTime || 'N/A'}
          </span>
        </div>

        <div className="d-flex align-items-center justify-content-between mt-auto pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
            <i className="bi bi-person me-1"></i>{recipe.authorName}
          </span>
          <div className="d-flex gap-2">
            {onSaveToggle && (
              <button onClick={(e) => { e.preventDefault(); onSaveToggle(recipe.id); }}
                className="btn btn-sm p-0 border-0" style={{ background: 'none', color: recipe.savedByCurrentUser ? '#e63946' : '#aaa' }}
                title={recipe.savedByCurrentUser ? 'Unsave' : 'Save'}>
                <i className={`bi ${recipe.savedByCurrentUser ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '1.1rem' }}></i>
              </button>
            )}
            <Link to={`/recipes/${recipe.id}`} className="btn btn-sm btn-outline-primary px-3" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
