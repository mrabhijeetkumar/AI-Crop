import React, { useState } from "react";
import { Building2, MapPin, Ruler, Save, Sprout, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useFarm } from "../../context/FarmContext.jsx";

export function OnboardingView() {
  const { user, updateProfile, updateFarmProfile: saveAuthFarmProfile, isSaving } = useAuth();
  const { farmProfile, updateFarmProfile: saveFarmProfile } = useFarm();
  const [form, setForm] = useState({
    name: user?.name || "",
    farmName: farmProfile?.farmName || user?.farm_name || "",
    location: farmProfile?.location || user?.location || "",
    totalAreaAcres: farmProfile?.totalAreaAcres || "",
  });
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.farmName.trim() || !form.location.trim() || Number(form.totalAreaAcres) <= 0) {
      setError("Please complete your name, farm name, location and cultivated area.");
      return;
    }
    setError("");
    const profile = {
      farmName: form.farmName.trim(),
      ownerName: form.name.trim(),
      location: form.location.trim(),
      totalAreaAcres: Number(form.totalAreaAcres),
    };
    await updateProfile({ name: form.name.trim(), farmName: form.farmName.trim(), location: form.location.trim() });
    await saveAuthFarmProfile(profile);
    await saveFarmProfile(profile);
  };

  return (
    <main className="auth-onboarding-shell">
      <div className="auth-onboarding-brand"><Sprout /><span>AI Crop Profit</span></div>
      <section className="auth-onboarding-card">
        <div className="auth-onboarding-intro">
          <div className="auth-onboarding-icon"><Sprout /></div>
          <p className="auth-onboarding-eyebrow">Welcome to your workspace</p>
          <h1>Set up your farm profile</h1>
          <p>Save your own farm details to personalize crop insights, field records and recommendations.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-onboarding-form">
          <label><span><User /> Your name</span><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your full name" /></label>
          <label><span><Building2 /> Farm or estate name</span><input required value={form.farmName} onChange={(e) => update("farmName", e.target.value)} placeholder="Enter your farm name" /></label>
          <label><span><MapPin /> Farm location</span><input required value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="District, state, country" /></label>
          <label><span><Ruler /> Cultivated area (acres)</span><input required type="number" min="0.1" step="0.1" value={form.totalAreaAcres} onChange={(e) => update("totalAreaAcres", e.target.value)} placeholder="e.g. 12.5" /></label>
          {error && <p className="auth-onboarding-error">{error}</p>}
          <button type="submit" disabled={isSaving}><Save /> {isSaving ? "Saving profile..." : "Save and continue"}</button>
        </form>
      </section>
    </main>
  );
}

export default OnboardingView;
