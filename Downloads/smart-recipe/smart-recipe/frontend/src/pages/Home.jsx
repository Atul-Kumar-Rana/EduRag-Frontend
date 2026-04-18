import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const DIETS = ['All', 'Vegetarian', 'Vegan', 'Non-Veg', 'Gluten-Free', 'Keto'];
const CUISINES = ['All', 'Indian', 'Italian', 'Chinese', 'Mexican', 'American', 'Mediterranean'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const COMMON_INGREDIENTS = [
  'Chicken', 'Eggs', 'Rice', 'Pasta', 'Tomatoes', 'Onions', 'Garlic',
  'Potatoes', 'Spinach', 'Paneer', 'Lentils', 'Chickpeas', 'Mushrooms',
  'Cheese', 'Butter', 'Flour', 'Milk', 'Carrots', 'Bell Pepper', 'Oats'
];

// ── Beautiful AI Result Card ───────────────────────────────────────────────────
function AIRecipeResultCard({ recipe, onReset }) {
  const [activeTab, setActiveTab] = useState('ingredients');

  const nutrients = [
    { label: 'Calories', val: recipe.calories, unit: 'kcal', color: '#f4845f' },
    { label: 'Protein',  val: recipe.protein,  unit: 'g',    color: '#52b788' },
    { label: 'Carbs',    val: recipe.carbs,     unit: 'g',    color: '#4361ee' },
    { label: 'Fat',      val: recipe.fat,       unit: 'g',    color: '#f77f00' },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', marginBottom: '2rem' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', padding: '1.5rem 2rem', color: '#fff' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span style={{ background: '#52b788', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>✨ AI GENERATED</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>{recipe.difficulty}</span>
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '0.4rem' }}>{recipe.title}</h2>
        <p style={{ opacity: 0.85, fontSize: '0.95rem', marginBottom: '1rem' }}>{recipe.description}</p>
        <div className="d-flex flex-wrap gap-4">
          {[
            { icon: '⏱', label: recipe.time },
            { icon: '👤', label: recipe.servings + ' servings' },
            { icon: '📊', label: recipe.difficulty },
          ].map((m, i) => (
            <span key={i} style={{ fontSize: '0.88rem', opacity: 0.9 }}>{m.icon} <strong>{m.label}</strong></span>
          ))}
        </div>
      </div>

      {/* Nutrition Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
        {nutrients.map((n, i) => (
          <div key={i} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: n.color }}>{n.val || '–'}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>{n.unit}</div>
            <div style={{ fontSize: '0.72rem', color: '#aaa' }}>{n.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        {['ingredients', 'steps'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize', color: activeTab === tab ? 'var(--primary, #2d6a4f)' : '#888', borderBottom: activeTab === tab ? '2px solid #2d6a4f' : '2px solid transparent', transition: 'all 0.15s' }}>
            {tab === 'ingredients' ? '🥕 Ingredients' : '👨‍🍳 Steps'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '1.5rem 2rem' }}>
        {activeTab === 'ingredients' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {(recipe.ingredients || []).map((ing, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0f7f4', borderRadius: 10, fontSize: '0.88rem', color: '#1a1a1a' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52b788', flexShrink: 0 }}></span>
                {ing}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {(recipe.steps || []).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 6, fontSize: '0.92rem', lineHeight: 1.65, color: '#333', borderBottom: i < recipe.steps.length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: 18, flex: 1 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chef Tip */}
        {recipe.tip && (
          <div style={{ marginTop: '1rem', background: '#fff8f0', border: '1px solid #fde8d0', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem' }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c65d00', marginBottom: 3 }}>CHEF'S TIP</div>
              <div style={{ fontSize: '0.9rem', color: '#7a4000', lineHeight: 1.5 }}>{recipe.tip}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 2rem', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onReset}
          style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid #ddd', background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
          ← Try Again
        </button>
        <Link to="/add-recipe"
          style={{ padding: '10px 24px', borderRadius: 10, background: '#2d6a4f', color: '#fff', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          📥 Save as Recipe
        </Link>
      </div>
    </div>
  );
}

// ── AI Generator Panel ─────────────────────────────────────────────────────────
function AIRecipeGenerator({ isAuthenticated }) {
  const [selected, setSelected]   = useState(new Set());
  const [custom, setCustom]       = useState('');
  const [dietPref, setDietPref]   = useState('Any');
  const [timePref, setTimePref]   = useState('30 min');
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]         = useState('');

  const toggle = (ing) => {
    const s = new Set(selected);
    s.has(ing) ? s.delete(ing) : s.add(ing);
    setSelected(s);
  };

  const addCustom = () => {
    if (custom.trim()) { setSelected(new Set([...selected, custom.trim()])); setCustom(''); }
  };

  const generate = async () => {
    if (selected.size === 0) { setError('Pick at least one ingredient!'); return; }
    setError(''); setAiLoading(true); setAiResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredients: [...selected].join(', '),
          dietType: dietPref,
          cookTime: timePref
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to generate recipe. Please try again.');
        return;
      }
      setAiResult(data.recipe);
    } catch (e) {
      setError('Network error. Make sure backend is running on port 8080.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Not logged in — show login prompt ────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', borderRadius: 20, padding: '2.5rem 2rem', color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤖</div>
        <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: '0.5rem' }}>AI Recipe Generator</h4>
        <p style={{ opacity: 0.85, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
          Tell us what ingredients you have and our AI will create a perfect recipe just for you!
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" style={{ padding: '10px 28px', borderRadius: 10, background: '#f4845f', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
            Login to Use AI
          </Link>
          <Link to="/register" style={{ padding: '10px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
            Sign Up Free
          </Link>
        </div>
      </div>
    );
  }

  // ── Show result card ──────────────────────────────────────────────────────
  if (aiResult) {
    return <AIRecipeResultCard recipe={aiResult} onReset={() => { setAiResult(null); setSelected(new Set()); }} />;
  }

  // ── Generator Form ────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', borderRadius: 20, padding: '2rem', color: '#fff', marginBottom: '2rem' }}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <span style={{ fontSize: '2rem' }}>🤖</span>
        <div>
          <h4 className="mb-0" style={{ fontFamily: 'Playfair Display, serif', color: '#fff' }}>AI Recipe Generator</h4>
          <p className="mb-0" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Pick ingredients you have — get an instant AI-crafted recipe</p>
        </div>
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '0 0 1rem' }} />

      <p style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PICK INGREDIENTS YOU HAVE</p>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {COMMON_INGREDIENTS.map(ing => (
          <button key={ing} onClick={() => toggle(ing)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: selected.has(ing) ? '2px solid #52b788' : '1.5px solid rgba(255,255,255,0.3)', background: selected.has(ing) ? '#52b788' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.15s' }}>
            {selected.has(ing) && '✓ '}{ing}
          </button>
        ))}
      </div>

      <div className="d-flex gap-2 mb-3">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="Add your own ingredient..."
          style={{ flex: 1, borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 14px', fontSize: '0.88rem', outline: 'none' }} />
        <button onClick={addCustom}
          style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          + Add
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <p style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>DIET PREFERENCE</p>
          <div className="d-flex flex-wrap gap-2">
            {['Any','Vegetarian','Vegan','Non-Veg','Gluten-Free'].map(d => (
              <button key={d} onClick={() => setDietPref(d)}
                style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer', border: dietPref === d ? '2px solid #f4845f' : '1.5px solid rgba(255,255,255,0.3)', background: dietPref === d ? '#f4845f' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <p style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>COOKING TIME</p>
          <div className="d-flex flex-wrap gap-2">
            {['Under 20 min','30 min','45 min','1 hour+'].map(t => (
              <button key={t} onClick={() => setTimePref(t)}
                style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer', border: timePref === t ? '2px solid #f4845f' : '1.5px solid rgba(255,255,255,0.3)', background: timePref === t ? '#f4845f' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[...selected].map(ing => (
            <span key={ing} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '3px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {ing}
              <span onClick={() => toggle(ing)} style={{ cursor: 'pointer', opacity: 0.7, fontSize: '1.1rem', lineHeight: 1 }}>×</span>
            </span>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(220,53,69,0.25)', border: '1px solid rgba(220,53,69,0.5)', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem', marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      <button onClick={generate} disabled={aiLoading || selected.size === 0}
        style={{ width: '100%', padding: '14px', borderRadius: 10, background: aiLoading || selected.size === 0 ? 'rgba(255,255,255,0.2)' : '#f4845f', border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: aiLoading || selected.size === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
        {aiLoading
          ? <><span className="spinner-border spinner-border-sm me-2"></span>Generating your recipe...</>
          : `✨ Generate AI Recipe${selected.size > 0 ? ` (${selected.size} ingredients)` : ''}`}
      </button>
    </div>
  );
}

// ── Main Home Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [keyword, setKeyword]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [diet, setDiet]               = useState('All');
  const [cuisine, setCuisine]         = useState('All');
  const [difficulty, setDifficulty]   = useState('All');
  const [toast, setToast]             = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (diet !== 'All') params.dietType = diet;
      if (cuisine !== 'All') params.cuisineType = cuisine;
      if (difficulty !== 'All') params.difficulty = difficulty;
      const hasFilters = Object.keys(params).length > 0;
      const res = hasFilters ? await recipeService.search(params) : await recipeService.getAll();
      setRecipes(res.data);
    } catch {
      setToast({ message: 'Failed to load recipes', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [keyword, diet, cuisine, difficulty]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleSearch = (e) => { e.preventDefault(); setKeyword(searchInput.trim()); };

  const handleSaveToggle = async (id) => {
    if (!isAuthenticated) { setToast({ message: 'Please login to save recipes', type: 'info' }); return; }
    try {
      const res = await recipeService.toggleSave(id);
      setToast({ message: res.data.message, type: 'success' });
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, savedByCurrentUser: !r.savedByCurrentUser } : r));
    } catch {
      setToast({ message: 'Could not save recipe', type: 'error' });
    }
  };

  const clearFilters = () => { setDiet('All'); setCuisine('All'); setDifficulty('All'); setKeyword(''); setSearchInput(''); };
  const hasActiveFilters = diet !== 'All' || cuisine !== 'All' || difficulty !== 'All' || keyword;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Smart Recipe</h1>
          <p>Browse community recipes or let AI generate one from ingredients you have at home.</p>
          <form className="d-flex search-bar" onSubmit={handleSearch}>
            <input type="text" className="form-control"
              placeholder="Search recipes, cuisines, ingredients..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <button type="submit"><i className="bi bi-search me-1"></i>Search</button>
          </form>
        </div>
      </section>

      <div className="container py-4">

        {/* AI Generator */}
        <AIRecipeGenerator isAuthenticated={isAuthenticated} />

        {/* Filters */}
        <div className="bg-white rounded-3 p-3 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-funnel" style={{ color: 'var(--primary)' }}></i>
            <strong style={{ fontSize: '0.9rem' }}>Filter Community Recipes</strong>
          </div>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>DIET</label>
              <div className="d-flex flex-wrap gap-2">
                {DIETS.map(d => <button key={d} className={`filter-chip ${diet === d ? 'active' : ''}`} onClick={() => setDiet(d)}>{d}</button>)}
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>CUISINE</label>
              <div className="d-flex flex-wrap gap-2">
                {CUISINES.map(c => <button key={c} className={`filter-chip ${cuisine === c ? 'active' : ''}`} onClick={() => setCuisine(c)}>{c}</button>)}
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>DIFFICULTY</label>
              <div className="d-flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => <button key={d} className={`filter-chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>)}
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid #eee' }}>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1"></i>Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Community heading */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
            {keyword ? `Results for "${keyword}"` : '🌍 Community Recipes'}
            {!loading && <span className="text-muted fw-normal ms-2" style={{ fontSize: '1rem' }}>({recipes.length})</span>}
          </h5>
          {isAuthenticated && (
            <Link to="/add-recipe" className="btn btn-sm btn-primary px-3" style={{ borderRadius: 20, fontSize: '0.85rem' }}>
              <i className="bi bi-plus me-1"></i>Share a Recipe
            </Link>
          )}
        </div>

        {loading ? <Loader /> : recipes.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>🔍</div>
            <h5 className="mt-3 text-muted">No recipes found</h5>
            <p className="text-muted">Try different filters or be the first to add one!</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-outline-primary" onClick={clearFilters}>Clear Filters</button>
              {isAuthenticated && <Link to="/add-recipe" className="btn btn-primary">Add Recipe</Link>}
            </div>
          </div>
        ) : (
          <div className="row g-4 fade-in">
            {recipes.map(recipe => (
              <div key={recipe.id} className="col-sm-6 col-lg-4 col-xl-3">
                <RecipeCard recipe={recipe} onSaveToggle={handleSaveToggle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
