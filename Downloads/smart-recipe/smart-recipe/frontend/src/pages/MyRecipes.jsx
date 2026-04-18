import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    recipeService.getMyRecipes()
      .then(res => setRecipes(res.data))
      .catch(() => setToast({ message: 'Failed to load your recipes', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4 fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 style={{ fontFamily: 'Playfair Display, serif' }}>
          My Recipes <span className="text-muted fw-normal" style={{ fontSize: '1.2rem' }}>({recipes.length})</span>
        </h3>
        <Link to="/add-recipe" className="btn btn-primary px-4" style={{ borderRadius: '8px', fontWeight: 600 }}>
          <i className="bi bi-plus-lg me-2"></i>New Recipe
        </Link>
      </div>

      {loading ? <Loader /> : recipes.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem' }}>📖</div>
          <h5 className="mt-3 text-muted">No recipes yet</h5>
          <p className="text-muted">Start sharing your favourite dishes with the world!</p>
          <Link to="/add-recipe" className="btn btn-primary px-4 mt-2" style={{ borderRadius: '8px' }}>
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {recipes.map(r => (
            <div key={r.id} className="col-sm-6 col-lg-4 col-xl-3">
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
