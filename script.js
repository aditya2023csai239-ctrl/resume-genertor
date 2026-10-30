const state = {
  step: 0,
  experiences: [{ role: "", company: "", location: "", start: "", end: "", description: "" }],
  education: [{ school: "", degree: "", year: "" }],
  skills: []
};

const form = document.querySelector("#resume-form");
const panels = [...document.querySelectorAll(".form-step")];
const steps = [...document.querySelectorAll(".step")];
const preview = document.querySelector("#resume-preview");

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
function values() {
  return Object.fromEntries(new FormData(form).entries());
}
function save() {
  localStorage.setItem("resume-studio", JSON.stringify({ ...state, fields: values() }));
  document.querySelector(".save-status").innerHTML = '<span class="status-dot"></span> Saved just now';
}
function hydrate() {
  try {
    const saved = JSON.parse(localStorage.getItem("resume-studio"));
    if (!saved) return;
    Object.assign(state, saved);
    if (saved.fields) Object.entries(saved.fields).forEach(([key, value]) => {
      const input = form.elements[key];
      if (input && input.type !== "radio") input.value = value;
    });
    if (saved.fields?.style) document.querySelector(`input[name="style"][value="${saved.fields.style}"]`).checked = true;
  } catch (error) { console.warn("Could not restore saved resume.", error); }
}
function renderEntries() {
  const exp = document.querySelector("#experience-list");
  exp.innerHTML = state.experiences.map((item, index) => `<div class="entry-card">
    ${state.experiences.length > 1 ? `<button type="button" class="remove-entry" data-remove="experience" data-index="${index}">Remove</button>` : ""}
    <div class="entry-grid">
      <label class="field"><span>Job title <b>*</b></span><input data-kind="experience" data-index="${index}" data-field="role" value="${esc(item.role)}" placeholder="e.g. Senior Product Designer"></label>
      <label class="field"><span>Company</span><input data-kind="experience" data-index="${index}" data-field="company" value="${esc(item.company)}" placeholder="e.g. Northstar Labs"></label>
      <label class="field"><span>Location</span><input data-kind="experience" data-index="${index}" data-field="location" value="${esc(item.location)}" placeholder="e.g. Remote"></label>
      <label class="field"><span>Dates</span><input data-kind="experience" data-index="${index}" data-field="start" value="${esc(item.start)}" placeholder="e.g. 2022 – Present"></label>
      <label class="field full"><span>What did you accomplish?</span><textarea rows="3" data-kind="experience" data-index="${index}" data-field="description" placeholder="Share a result, project, or responsibility.">${esc(item.description)}</textarea></label>
    </div></div>`).join("");
  const edu = document.querySelector("#education-list");
  edu.innerHTML = state.education.map((item, index) => `<div class="entry-card">
    ${state.education.length > 1 ? `<button type="button" class="remove-entry" data-remove="education" data-index="${index}">Remove</button>` : ""}
    <div class="entry-grid"><label class="field"><span>School / institution</span><input data-kind="education" data-index="${index}" data-field="school" value="${esc(item.school)}" placeholder="e.g. University of Texas"></label><label class="field"><span>Degree or program</span><input data-kind="education" data-index="${index}" data-field="degree" value="${esc(item.degree)}" placeholder="e.g. B.A. in Design"></label><label class="field"><span>Year</span><input data-kind="education" data-index="${index}" data-field="year" value="${esc(item.year)}" placeholder="e.g. 2022"></label></div></div>`).join("");
}
function renderSkills() {
  document.querySelector("#skill-chips").innerHTML = state.skills.map((skill, i) => `<span class="skill-chip">${esc(skill)} <button type="button" data-skill-index="${i}" aria-label="Remove ${esc(skill)}">×</button></span>`).join("");
}
function renderPreview() {
  const data = values();
  const hasExp = state.experiences.some(item => item.role || item.company);
  const hasEdu = state.education.some(item => item.school || item.degree);
  const experience = hasExp ? `<section class="resume-section"><h3 class="resume-section-title">EXPERIENCE</h3>${state.experiences.filter(x => x.role || x.company).map(x => `<article class="resume-item"><div class="resume-item-top"><h4>${esc(x.role || "Role")}</h4><span class="date">${esc(x.start)}</span></div><div class="org">${esc(x.company)}${x.location ? ` · ${esc(x.location)}` : ""}</div>${x.description ? `<p>${esc(x.description)}</p>` : ""}</article>`).join("")}</section>` : "";
  const education = hasEdu ? `<section class="resume-section"><h3 class="resume-section-title">EDUCATION</h3>${state.education.filter(x => x.school || x.degree).map(x => `<div class="resume-item resume-education"><span><b>${esc(x.degree || "Program")}</b><br><small>${esc(x.school)}</small></span><small>${esc(x.year)}</small></div>`).join("")}</section>` : "";
  const skills = state.skills.length ? `<section class="resume-section"><h3 class="resume-section-title">SKILLS</h3><div class="resume-skills">${state.skills.map(skill => `<span class="resume-skill">${esc(skill)}</span>`).join("")}</div></section>` : "";
  preview.className = `resume-page ${data.style || "editorial"}`;
  preview.innerHTML = `<header class="resume-header"><h2 class="resume-name">${esc(data.name || "Your Name")}</h2><p class="resume-title">${esc(data.title || "Your Professional Title")}</p><div class="resume-contact">${[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map(esc).map(x => `<span>${x}</span>`).join("") || "<span>email@example.com · City, Country</span>"}</div></header>${data.summary ? `<section class="resume-section"><h3 class="resume-section-title">PROFILE</h3><p class="resume-summary">${esc(data.summary)}</p></section>` : ""}${experience}${education}${skills}${data.achievement ? `<section class="resume-section"><h3 class="resume-section-title">HIGHLIGHT</h3><p class="resume-summary">${esc(data.achievement)}</p></section>` : ""}`;
}
function updateProgress() {
  const data = values();
  let score = 0;
  if (data.name && data.email) score += 25;
  if (data.title && data.summary) score += 20;
  if (state.experiences.some(x => x.role || x.company)) score += 25;
  if (state.education.some(x => x.school || x.degree)) score += 15;
  if (state.skills.length) score += 15;
  document.querySelector("#progress-value").textContent = `${score}%`;
  document.querySelector("#progress-bar").style.width = `${Math.max(score, 8)}%`;
  steps.forEach((step, i) => step.classList.toggle("complete", i < state.step || (i === 0 && score >= 25)));
}
function showStep(index) {
  state.step = Math.max(0, Math.min(4, index));
  panels.forEach((panel, i) => panel.classList.toggle("active", i === state.step));
  steps.forEach((step, i) => step.classList.toggle("active", i === state.step));
  document.querySelector("#back-btn").disabled = state.step === 0;
  document.querySelector("#next-btn").innerHTML = state.step === 4 ? 'Finish & preview <span>✦</span>' : 'Continue <span>→</span>';
}

form.addEventListener("input", event => {
  if (event.target.matches("[data-kind]")) state[event.target.dataset.kind === "experience" ? "experiences" : "education"][event.target.dataset.index][event.target.dataset.field] = event.target.value;
  renderPreview(); updateProgress(); save();
});
form.addEventListener("change", () => { renderPreview(); save(); });
document.querySelector("#skills-input").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    const value = event.target.value.trim();
    if (value && state.skills.length < 12 && !state.skills.includes(value)) state.skills.push(value);
    event.target.value = ""; renderSkills(); renderPreview(); updateProgress(); save();
  }
});
document.querySelector("#skill-chips").addEventListener("click", event => { if (event.target.dataset.skillIndex) { state.skills.splice(Number(event.target.dataset.skillIndex), 1); renderSkills(); renderPreview(); updateProgress(); save(); } });
document.querySelector("#experience-list").addEventListener("click", event => { if (event.target.dataset.remove) { state.experiences.splice(Number(event.target.dataset.index), 1); renderEntries(); renderPreview(); save(); } });
document.querySelector("#education-list").addEventListener("click", event => { if (event.target.dataset.remove) { state.education.splice(Number(event.target.dataset.index), 1); renderEntries(); renderPreview(); save(); } });
document.querySelector("#add-experience").addEventListener("click", () => { state.experiences.push({ role: "", company: "", location: "", start: "", end: "", description: "" }); renderEntries(); });
document.querySelector("#add-education").addEventListener("click", () => { state.education.push({ school: "", degree: "", year: "" }); renderEntries(); });
steps.forEach(step => step.addEventListener("click", () => showStep(Number(step.dataset.step))));
document.querySelector("#back-btn").addEventListener("click", () => showStep(state.step - 1));
document.querySelector("#next-btn").addEventListener("click", () => { if (state.step < 4) showStep(state.step + 1); else window.print(); });
document.querySelector("#download-btn").addEventListener("click", () => window.print());
document.querySelector("#reset-btn").addEventListener("click", () => { if (confirm("Start over and clear your saved resume?")) { localStorage.removeItem("resume-studio"); window.location.reload(); } });
document.querySelectorAll(".style-option").forEach(option => option.addEventListener("click", () => { document.querySelectorAll(".style-option").forEach(x => x.classList.remove("selected")); option.classList.add("selected"); }));

hydrate(); renderEntries(); renderSkills(); renderPreview(); updateProgress(); showStep(state.step);
