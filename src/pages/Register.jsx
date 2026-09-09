import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form,setForm] = useState({name:"",email:"",password:"",role:"CUSTOMER"});
  const [error,setError] = useState("");
  const [saving,setSaving] = useState(false);
  function handleChange(e){setForm({...form,[e.target.name]:e.target.value});}
  async function handleSubmit(e){
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const existing=await api.get(`/users?email=${encodeURIComponent(form.email)}`);
      if(existing.data.length){setError("An account with this email already exists.");return;}
      await api.post("/users",form); navigate("/login");
    } catch {setError("Unable to create your account. Make sure JSON Server is running.");}
    finally{setSaving(false);}
  }
  return <div className="auth-page">
    <div className="auth-visual"><span className="auth-badge">EVENTHUB</span><h1>Bring people together around moments that matter.</h1><p>Create an account to manage memorable events, bookings and experiences.</p><div className="auth-stat-row"><span>✦ Easy to use</span><span>✓ Role based</span></div></div>
    <div className="auth-card">
      <div className="auth-heading"><span className="eyebrow">WELCOME</span><h2>Create your account</h2><p>Choose how you want to use EventHub.</p></div>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Full name<input required name="name" placeholder="Your name" value={form.name} onChange={handleChange}/></label>
        <label>Email address<input required type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange}/></label>
        <label>Password<input required minLength="6" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange}/></label>
        <label>Account type<select name="role" value={form.role} onChange={handleChange}><option value="CUSTOMER">🎟️ Customer — book events</option><option value="ORGANIZER">✨ Organizer — create events</option></select></label>
        <button className="submit-btn" disabled={saving}>{saving?"Creating account...":"Create account →"}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  </div>;
}
export default Register;
