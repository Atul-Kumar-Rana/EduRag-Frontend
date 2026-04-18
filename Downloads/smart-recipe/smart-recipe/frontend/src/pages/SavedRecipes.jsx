import React, { useState, useEffect } from 'react';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSaved = () => {
    recipeService.getSaved()
      .then(res => setRecipes(res.data))
      .catch(() => setToast({ message: 'Failed to load saved recipes', type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleUnsave = async (id) => {
    try {
      await recipeService.toggleSave(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Recipe removed from saved', type: 'success' });
    } catch {
      setToast({ message: 'Error removing recipe', type: 'error' });
    }
  };

  return (
    <div className="container py-4 fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <h3 className="mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
        Saved Recipes <span className="text-muted fw-normal" style={{ fontSize: '1.2rem' }}>({recipes.length})</span>
      </h3>

      {loading ? <Loader /> : recipes.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem' }}>🔖</div>
          <h5 className="mt-3 text-muted">No saved recipes</h5>
          <p className="text-muted">Browse recipes and tap the heart icon to save them here.</p>
        </div>
      ) : (
        <div className="row g-4">
          {recipes.map(r => (
            <div key={r.id} className="col-sm-6 col-lg-4 col-xl-3">
              <RecipeCard
                recipe={{ ...r, savedByCurrentUser: true }}
                onSaveToggle={handleUnsave}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
