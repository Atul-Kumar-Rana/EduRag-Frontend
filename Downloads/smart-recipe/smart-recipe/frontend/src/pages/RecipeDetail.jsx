import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

function StarInput({ value, onChange }) {
  return (
    <div className="d-flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', color: s <= value ? '#e0a800' : '#ddd', padding: 0 }}>
          <i className={`bi ${s <= value ? 'bi-star-fill' : 'bi-star'}`}></i>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete, currentUserId }) {
  return (
    <div className="d-flex gap-3 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d8f3dc', color: '#1b4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
        {review.userName?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <span className="fw-600" style={{ fontSize: '0.9rem' }}>{review.userName}</span>
            <span className="ms-2">
              {[1,2,3,4,5].map(s => (
                <i key={s} className={`bi ${s <= review.rating ? 'bi-star-fill star' : 'bi-star star empty'}`} style={{ fontSize: '0.7rem' }}></i>
              ))}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
            {currentUserId === review.userId && (
              <button onClick={() => onDelete(review.id)} className="btn btn-sm p-0 border-0 text-danger" style={{ background: 'none' }}>
                <i className="bi bi-trash" style={{ fontSize: '0.85rem' }}></i>
              </button>
            )}
          </div>
        </div>
        {review.comment && <p className="mb-0 mt-1 text-muted" style={{ fontSize: '0.88rem' }}>{review.comment}</p>}
      </div>
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, revRes] = await Promise.all([
          recipeService.getById(id),
          reviewService.getByRecipe(id)
        ]);
        setRecipe(rRes.data);
        setReviews(revRes.data);
      } catch {
        setToast({ message: 'Recipe not found', type: 'error' });
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!isAuthenticated) { setToast({ message: 'Please login to save', type: 'info' }); return; }
    try {
      const res = await recipeService.toggleSave(id);
      setRecipe(prev => ({ ...prev, savedByCurrentUser: !prev.savedByCurrentUser }));
      setToast({ message: res.data.message, type: 'success' });
    } catch { setToast({ message: 'Error saving recipe', type: 'error' }); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await recipeService.delete(id);
      setToast({ message: 'Recipe deleted', type: 'success' });
      setTimeout(() => navigate('/my-recipes'), 1200);
    } catch { setToast({ message: 'Could not delete recipe', type: 'error' }); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reviewService.add(id, reviewForm);
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      setToast({ message: 'Review added!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not submit review', type: 'error' });
    } finally { setSubmitting(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.delete(id, reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setToast({ message: 'Review deleted', type: 'success' });
    } catch { setToast({ message: 'Could not delete review', type: 'error' }); }
  };

  if (loading) return <div className="container py-5"><Loader /></div>;
  if (!recipe) return null;

  const isOwner = user?.id === recipe.authorId;

  return (
    <div className="container py-4 fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb" style={{ fontSize: '0.85rem' }}>
          <li className="breadcrumb-item"><Link to="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li className="breadcrumb-item active">{recipe.title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Left column */}
        <div className="col-lg-7">
          {recipe.imageUrl
            ? <img src={recipe.imageUrl} alt={recipe.title} className="recipe-detail-img mb-4" />
            : <div className="recipe-detail-placeholder mb-4">🍽</div>
          }

          {/* Steps */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
            <h4 style={{ fontFamily: 'Playfair Display, serif' }}>Instructions</h4>
            <hr />
            {recipe.steps?.length > 0 ? recipe.steps.map(step => (
              <div key={step.id} className="d-flex gap-3 mb-3">
                <div className="step-circle">{step.stepNumber}</div>
                <p className="mb-0" style={{ paddingTop: '4px', lineHeight: 1.6 }}>{step.instruction}</p>
              </div>
            )) : <p className="text-muted">No steps provided.</p>}
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-5">
          <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex gap-2 flex-wrap">
                {recipe.dietType && <span className="badge-diet">{recipe.dietType}</span>}
                {recipe.difficulty && <span className="badge-diff">{recipe.difficulty}</span>}
                {recipe.cuisineType && <span className="badge" style={{ background: '#e3e0ff', color: '#4a40b5', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px' }}>{recipe.cuisineType}</span>}
              </div>
              <div className="d-flex gap-2">
                <button onClick={handleSave} className="btn btn-sm border-0 p-1"
                  style={{ color: recipe.savedByCurrentUser ? '#e63946' : '#aaa', background: 'none', fontSize: '1.3rem' }}
                  title={recipe.savedByCurrentUser ? 'Unsave' : 'Save'}>
                  <i className={`bi ${recipe.savedByCurrentUser ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                </button>
                {isOwner && (
                  <>
                    <Link to={`/edit-recipe/${id}`} className="btn btn-sm btn-outline-secondary px-3" style={{ borderRadius: '8px', fontSize: '0.82rem' }}>
                      <i className="bi bi-pencil me-1"></i>Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-sm btn-outline-danger px-3" style={{ borderRadius: '8px', fontSize: '0.82rem' }}>
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <h2 style={{ fontFamily: 'Playfair Display, serif' }}>{recipe.title}</h2>
            <p className="text-muted">{recipe.description}</p>

            <div className="row g-3 my-2">
              {[
                { icon: 'bi-clock', label: 'Cook Time', val: recipe.cookTime || 'N/A' },
                { icon: 'bi-people', label: 'Servings', val: recipe.servings || 'N/A' },
                { icon: 'bi-fire', label: 'Calories', val: recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kcal` : 'N/A' },
                { icon: 'bi-star-fill', label: 'Rating', val: `${recipe.averageRating?.toFixed(1) || '0.0'} (${recipe.reviewCount || 0})` },
              ].map(item => (
                <div key={item.label} className="col-6">
                  <div style={{ background: '#f8f9f4', borderRadius: '10px', padding: '10px 14px' }}>
                    <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}><i className={`bi ${item.icon} me-1`}></i>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.82rem' }}>
              <i className="bi bi-person me-1"></i>By <strong>{recipe.authorName}</strong>
            </p>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
            <h5 style={{ fontFamily: 'Playfair Display, serif' }}>Ingredients</h5>
            <hr />
            {recipe.ingredients?.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {recipe.ingredients.map(ing => (
                  <div key={ing.id} className="ingredient-item d-flex justify-content-between align-items-center">
                    <span>{ing.name}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted">No ingredients listed.</p>}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3 p-4 shadow-sm">
            <h5 style={{ fontFamily: 'Playfair Display, serif' }}>Reviews ({reviews.length})</h5>
            <hr />

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="mb-4 p-3" style={{ background: '#f8f9f4', borderRadius: '10px' }}>
                <label className="form-label fw-600" style={{ fontSize: '0.85rem' }}>Your Rating</label>
                <StarInput value={reviewForm.rating} onChange={r => setReviewForm({ ...reviewForm, rating: r })} />
                <textarea className="form-control mb-2" rows={3} placeholder="Write your review (optional)..."
                  value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ fontSize: '0.9rem' }} />
                <button type="submit" className="btn btn-primary btn-sm px-4" disabled={submitting} style={{ borderRadius: '8px' }}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="alert alert-light text-center py-3 mb-4" style={{ borderRadius: '10px' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to leave a review
              </div>
            )}

            {reviews.length === 0
              ? <p className="text-muted text-center py-2">No reviews yet. Be the first!</p>
              : reviews.map(r => <ReviewCard key={r.id} review={r} onDelete={handleDeleteReview} currentUserId={user?.id} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
