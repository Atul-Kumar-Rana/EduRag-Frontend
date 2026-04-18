import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService } from '../services/api';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const EMPTY_FORM = {
  title: '', description: '', cookTime: '', servings: '',
  difficulty: '', cuisineType: '', dietType: '', imageUrl: '',
  caloriesPerServing: '', ingredients: [{ name: '', quantity: '', unit: '' }],
  steps: [{ stepNumber: 1, instruction: '' }],
};

export default function AddEditRecipe() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    recipeService.getById(id).then(res => {
      const r = res.data;
      setForm({
        title: r.title || '', description: r.description || '',
        cookTime: r.cookTime || '', servings: r.servings || '',
        difficulty: r.difficulty || '', cuisineType: r.cuisineType || '',
        dietType: r.dietType || '', imageUrl: r.imageUrl || '',
        caloriesPerServing: r.caloriesPerServing || '',
        ingredients: r.ingredients?.length ? r.ingredients : [{ name: '', quantity: '', unit: '' }],
        steps: r.steps?.length ? r.steps : [{ stepNumber: 1, instruction: '' }],
      });
    }).catch(() => setToast({ message: 'Failed to load recipe', type: 'error' }))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.ingredients.some(i => !i.name.trim())) e.ingredients = 'All ingredient names are required';
    if (form.steps.some(s => !s.instruction.trim())) e.steps = 'All steps must have instructions';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleIngChange = (idx, field, val) => {
    const updated = form.ingredients.map((ing, i) => i === idx ? { ...ing, [field]: val } : ing);
    setForm({ ...form, ingredients: updated });
  };
  const addIng = () => setForm({ ...form, ingredients: [...form.ingredients, { name: '', quantity: '', unit: '' }] });
  const removeIng = (idx) => setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });

  const handleStepChange = (idx, val) => {
    const updated = form.steps.map((s, i) => i === idx ? { ...s, instruction: val } : s);
    setForm({ ...form, steps: updated });
  };
  const addStep = () => setForm({ ...form, steps: [...form.steps, { stepNumber: form.steps.length + 1, instruction: '' }] });
  const removeStep = (idx) => setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, caloriesPerServing: form.caloriesPerServing ? Number(form.caloriesPerServing) : null };
      if (isEdit) {
        await recipeService.update(id, payload);
        setToast({ message: 'Recipe updated!', type: 'success' });
      } else {
        const res = await recipeService.create(payload);
        setToast({ message: 'Recipe created!', type: 'success' });
        setTimeout(() => navigate(`/recipes/${res.data.id}`), 1200);
        return;
      }
      setTimeout(() => navigate(`/recipes/${id}`), 1200);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save recipe', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="container py-5"><Loader /></div>;

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: 800 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm" style={{ borderRadius: '8px' }}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
        <h3 className="mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
          {isEdit ? 'Edit Recipe' : 'Create New Recipe'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Info */}
        <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
          <h5 className="mb-3" style={{ color: 'var(--primary)', fontWeight: 600 }}>Basic Information</h5>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Recipe Title *</label>
              <input name="title" className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="E.g. Creamy Butter Chicken" value={form.title} onChange={handleChange} />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={3}
                placeholder="Brief description of the dish..." value={form.description} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Cook Time</label>
              <input name="cookTime" className="form-control" placeholder="E.g. 30 mins" value={form.cookTime} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Servings</label>
              <input name="servings" className="form-control" placeholder="E.g. 4 people" value={form.servings} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Difficulty</label>
              <select name="difficulty" className="form-select" value={form.difficulty} onChange={handleChange}>
                <option value="">Select</option>
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Diet Type</label>
              <select name="dietType" className="form-select" value={form.dietType} onChange={handleChange}>
                <option value="">Select</option>
                {['Vegetarian', 'Vegan', 'Non-Veg', 'Gluten-Free', 'Keto'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Cuisine Type</label>
              <select name="cuisineType" className="form-select" value={form.cuisineType} onChange={handleChange}>
                <option value="">Select</option>
                {['Indian', 'Italian', 'Chinese', 'Mexican', 'American', 'Mediterranean', 'Japanese'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Calories per Serving</label>
              <input type="number" name="caloriesPerServing" className="form-control" placeholder="E.g. 350"
                value={form.caloriesPerServing} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Image URL</label>
              <input name="imageUrl" className="form-control" placeholder="https://..." value={form.imageUrl} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0" style={{ color: 'var(--primary)', fontWeight: 600 }}>Ingredients</h5>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addIng} style={{ borderRadius: '8px' }}>
              <i className="bi bi-plus me-1"></i>Add
            </button>
          </div>
          {errors.ingredients && <div className="alert alert-warning py-2 mb-3" style={{ fontSize: '0.85rem' }}>{errors.ingredients}</div>}
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="row g-2 mb-2 align-items-center">
              <div className="col-5">
                <input className="form-control form-control-sm" placeholder="Ingredient name *"
                  value={ing.name} onChange={e => handleIngChange(idx, 'name', e.target.value)} />
              </div>
              <div className="col-3">
                <input className="form-control form-control-sm" placeholder="Quantity"
                  value={ing.quantity} onChange={e => handleIngChange(idx, 'quantity', e.target.value)} />
              </div>
              <div className="col-3">
                <input className="form-control form-control-sm" placeholder="Unit (g, ml...)"
                  value={ing.unit} onChange={e => handleIngChange(idx, 'unit', e.target.value)} />
              </div>
              <div className="col-1">
                {form.ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIng(idx)} className="btn btn-sm text-danger border-0 p-0" style={{ background: 'none' }}>
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0" style={{ color: 'var(--primary)', fontWeight: 600 }}>Instructions</h5>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addStep} style={{ borderRadius: '8px' }}>
              <i className="bi bi-plus me-1"></i>Add Step
            </button>
          </div>
          {errors.steps && <div className="alert alert-warning py-2 mb-3" style={{ fontSize: '0.85rem' }}>{errors.steps}</div>}
          {form.steps.map((step, idx) => (
            <div key={idx} className="d-flex gap-3 mb-3 align-items-start">
              <div className="step-circle mt-1" style={{ flexShrink: 0 }}>{step.stepNumber}</div>
              <textarea className="form-control" rows={2} placeholder={`Step ${step.stepNumber} instructions...`}
                value={step.instruction} onChange={e => handleStepChange(idx, e.target.value)}
                style={{ fontSize: '0.9rem' }} />
              {form.steps.length > 1 && (
                <button type="button" onClick={() => removeStep(idx)} className="btn text-danger border-0 p-0 mt-1" style={{ background: 'none' }}>
                  <i className="bi bi-x-circle"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="d-flex gap-3 justify-content-end">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)} style={{ borderRadius: '8px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-5" disabled={loading} style={{ borderRadius: '8px', fontWeight: 600 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : (isEdit ? 'Update Recipe' : 'Publish Recipe')}
          </button>
        </div>
      </form>
    </div>
  );
}
