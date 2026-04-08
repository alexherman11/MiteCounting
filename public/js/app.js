// ============================================================
// Mite Counter - Application Logic
// ============================================================

const state = {
  currentMode: null,       // "mites" | "swd" | "lygus"
  inputMode: "direct",     // "direct" | "lifestage"
  activeLifeStage: null,   // stage key when in lifestage mode
  counts: {},              // { "tssm.adult": 5, ... }
  history: [],             // [{ key, prevValue }, ...]
  activeColumns: [],       // array of species IDs currently shown
  idPopupOpen: null,       // species ID if popup open
};

// ============================================================
// Initialization
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Mode selector buttons
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => loadMode(btn.dataset.mode));
  });

  // Top bar buttons
  document.getElementById("btn-back").addEventListener("click", goBack);
  document.getElementById("btn-direct").addEventListener("click", () => setInputMode("direct"));
  document.getElementById("btn-lifestage").addEventListener("click", () => setInputMode("lifestage"));
  document.getElementById("btn-undo").addEventListener("click", undo);
  document.getElementById("btn-reset").addEventListener("click", resetCounts);
  document.getElementById("btn-export").addEventListener("click", exportCounts);
  document.getElementById("btn-add").addEventListener("click", openAddModal);
  document.getElementById("btn-add-close").addEventListener("click", closeAddModal);
  document.getElementById("btn-add-custom").addEventListener("click", addCustomColumn);

  // ID popup
  document.getElementById("id-popup-close").addEventListener("click", closeIdPopup);

  // Keyboard handler
  document.addEventListener("keydown", handleKeydown);

  // Warn before closing if counts exist
  window.addEventListener("beforeunload", (e) => {
    if (hasAnyCounts()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
});

// ============================================================
// Mode Loading
// ============================================================

function loadMode(modeId) {
  const mode = MODES[modeId];
  if (!mode) return;

  state.currentMode = modeId;
  state.counts = {};
  state.history = [];
  state.inputMode = "direct";
  state.activeLifeStage = null;

  // Build active columns
  state.activeColumns = [...mode.defaultColumns, ...mode.extraColumns];

  // Init counts to 0
  state.activeColumns.forEach(colId => {
    const species = SPECIES[colId];
    if (species) {
      Object.keys(species.stages).forEach(stageKey => {
        state.counts[`${colId}.${stageKey}`] = 0;
      });
    }
  });

  // Update UI
  document.getElementById("mode-selector").classList.add("hidden");
  document.getElementById("counter-screen").classList.remove("hidden");
  document.getElementById("mode-label").textContent = mode.name + " Mode";

  // Set toggle state
  document.getElementById("btn-direct").classList.add("active");
  document.getElementById("btn-lifestage").classList.remove("active");
  document.getElementById("lifestage-indicator").classList.add("hidden");

  renderGrid();
}

function goBack() {
  if (hasAnyCounts() && !confirm("You have counts. Going back will clear them. Continue?")) return;
  state.currentMode = null;
  state.counts = {};
  state.history = [];
  document.getElementById("counter-screen").classList.add("hidden");
  document.getElementById("mode-selector").classList.remove("hidden");
  closeIdPopup();
}

// ============================================================
// Grid Rendering
// ============================================================

function renderGrid() {
  const grid = document.getElementById("counter-grid");
  grid.innerHTML = "";

  state.activeColumns.forEach((colId, colIndex) => {
    const species = SPECIES[colId];
    if (!species) return;

    const colors = COLUMN_PALETTE[colIndex % COLUMN_PALETTE.length];
    const col = document.createElement("div");
    col.className = "species-column";
    col.dataset.species = colId;
    col.style.background = colors.bg;
    col.style.border = `2px solid ${colors.border}`;

    // Header
    const header = document.createElement("div");
    header.className = "column-header";
    header.style.background = colors.header;
    header.innerHTML = `
      <span class="column-name">${species.name}</span>
      ${species.scientificName ? `<span class="column-sci">${species.scientificName}</span>` : ""}
    `;
    header.addEventListener("click", () => openIdPopup(colId));

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "column-remove";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remove column";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeColumn(colId);
    });
    header.appendChild(removeBtn);

    col.appendChild(header);

    // Body (stage rows)
    const body = document.createElement("div");
    body.className = "column-body";

    Object.entries(species.stages).forEach(([stageKey, stage]) => {
      const row = document.createElement("div");
      row.className = "stage-row";
      row.dataset.species = colId;
      row.dataset.stage = stageKey;

      // Thumbnail
      if (stage.image) {
        const img = document.createElement("img");
        img.className = "stage-thumb";
        img.src = stage.image;
        img.alt = `${species.name} ${stage.label}`;
        img.loading = "lazy";
        img.addEventListener("click", (e) => { e.stopPropagation(); openLightbox(stage.image, `${species.name} - ${stage.label}`); });
        row.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "stage-placeholder";
        ph.style.background = colors.accent;
        ph.textContent = species.name.charAt(0);
        row.appendChild(ph);
      }

      // Info section
      const info = document.createElement("div");
      info.className = "stage-info";
      info.innerHTML = `
        <div class="stage-label">${stage.label}</div>
        <div class="stage-count" id="count-${colId}-${stageKey}">0</div>
      `;
      row.appendChild(info);

      // Keycap
      if (stage.directKey) {
        const key = document.createElement("span");
        key.className = "stage-key";
        key.textContent = formatKey(stage.directKey);
        row.appendChild(key);
      }

      // Click to increment, right-click to decrement
      row.addEventListener("click", () => increment(colId, stageKey));
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        decrement(colId, stageKey);
      });

      body.appendChild(row);
    });

    col.appendChild(body);
    grid.appendChild(col);
  });

  updateHighlights();
}

function removeColumn(colId) {
  state.activeColumns = state.activeColumns.filter(id => id !== colId);
  if (state.activeColumns.length === 0) {
    showToast("Add at least one column");
    // Re-add it since we can't have zero columns
    state.activeColumns.push(colId);
    return;
  }
  renderGrid();
  showToast(`Removed ${SPECIES[colId] ? SPECIES[colId].name : colId}`);
}

function formatKey(key) {
  const names = { " ": "SPC", ",": ",", ".": ".", ";": ";", "/": "/", "'": "'", "Enter": "ENT", "Shift": "SHF" };
  return names[key] || key.toUpperCase();
}

// ============================================================
// Counting
// ============================================================

function increment(speciesId, stageKey) {
  const key = `${speciesId}.${stageKey}`;
  state.history.push({ key, prevValue: state.counts[key] || 0 });
  state.counts[key] = (state.counts[key] || 0) + 1;
  updateCountDisplay(speciesId, stageKey);
}

function decrement(speciesId, stageKey) {
  const key = `${speciesId}.${stageKey}`;
  const current = state.counts[key] || 0;
  if (current <= 0) return;
  state.history.push({ key, prevValue: current });
  state.counts[key] = current - 1;
  updateCountDisplay(speciesId, stageKey);
}

function updateCountDisplay(speciesId, stageKey) {
  const el = document.getElementById(`count-${speciesId}-${stageKey}`);
  if (!el) return;
  const key = `${speciesId}.${stageKey}`;
  el.textContent = state.counts[key] || 0;

  // Bump animation
  el.classList.remove("bump");
  void el.offsetWidth; // force reflow
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 150);
}

function undo() {
  if (state.history.length === 0) {
    showToast("Nothing to undo");
    return;
  }
  const last = state.history.pop();
  const [speciesId, stageKey] = last.key.split(".");
  state.counts[last.key] = last.prevValue;
  updateCountDisplay(speciesId, stageKey);
  showToast("Undone");
}

function resetCounts() {
  if (!hasAnyCounts()) { showToast("Already at zero"); return; }
  if (!confirm("Reset all counts to zero?")) return;
  Object.keys(state.counts).forEach(k => { state.counts[k] = 0; });
  state.history = [];
  // Update all displays
  state.activeColumns.forEach(colId => {
    const species = SPECIES[colId];
    if (species) {
      Object.keys(species.stages).forEach(sk => updateCountDisplay(colId, sk));
    }
  });
  showToast("Counts reset");
}

function hasAnyCounts() {
  return Object.values(state.counts).some(v => v > 0);
}

// ============================================================
// Keyboard Handling
// ============================================================

function handleKeydown(e) {
  // Ignore when typing in inputs
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (!state.currentMode) return;

  // Ctrl+Z = undo
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undo();
    return;
  }

  // Escape = close lightbox, popup, or go back
  if (e.key === "Escape") {
    const lb = document.getElementById("lightbox");
    if (lb && lb.classList.contains("visible")) { closeLightbox(); return; }
    if (state.idPopupOpen) { closeIdPopup(); }
    return;
  }

  // Tab = toggle input mode
  if (e.key === "Tab") {
    e.preventDefault();
    setInputMode(state.inputMode === "direct" ? "lifestage" : "direct");
    return;
  }

  if (state.inputMode === "direct") {
    handleDirectKey(e);
  } else {
    handleLifeStageKey(e);
  }
}

function handleDirectKey(e) {
  const mode = MODES[state.currentMode];
  if (!mode) return;

  // Build key map from active columns
  const key = e.key;
  for (const colId of state.activeColumns) {
    const species = SPECIES[colId];
    if (!species) continue;
    for (const [stageKey, stage] of Object.entries(species.stages)) {
      if (stage.directKey === key || stage.directKey === key.toLowerCase()) {
        e.preventDefault();
        increment(colId, stageKey);
        return;
      }
    }
  }
}

function handleLifeStageKey(e) {
  const mode = MODES[state.currentMode];
  if (!mode) return;

  // Stage selection keys: Space=adult, Enter=nymph, Shift=egg
  if (e.key === " ") {
    e.preventDefault();
    setActiveLifeStage("adult");
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    setActiveLifeStage("nymph");
    return;
  }
  if (e.key === "Shift") {
    e.preventDefault();
    setActiveLifeStage("egg");
    return;
  }

  // Column keys - only if a stage is active
  if (!state.activeLifeStage) return;

  const lifeStageKeys = mode.lifeStageKeys || {};
  const colId = lifeStageKeys[e.key] || lifeStageKeys[e.key.toLowerCase()];
  if (colId && state.activeColumns.includes(colId)) {
    e.preventDefault();
    // Find the matching stage in this column
    const species = SPECIES[colId];
    if (!species) return;

    // Map generic stage names to actual stage keys in this species
    const targetStage = findMatchingStage(species, state.activeLifeStage);
    if (targetStage) {
      increment(colId, targetStage);
    }
  }
}

function findMatchingStage(species, genericStage) {
  // Direct match
  if (species.stages[genericStage]) return genericStage;
  // For SWD mode: "adult" -> "male" (first stage), "nymph" -> "female" (second stage)
  const stageKeys = Object.keys(species.stages);
  const index = { adult: 0, nymph: 1, egg: 2 }[genericStage];
  if (index !== undefined && stageKeys[index]) return stageKeys[index];
  return null;
}

// ============================================================
// Input Mode
// ============================================================

function setInputMode(mode) {
  state.inputMode = mode;
  state.activeLifeStage = null;

  document.getElementById("btn-direct").classList.toggle("active", mode === "direct");
  document.getElementById("btn-lifestage").classList.toggle("active", mode === "lifestage");

  const indicator = document.getElementById("lifestage-indicator");
  if (mode === "lifestage") {
    indicator.classList.remove("hidden");
    indicator.textContent = "Press SPC=Adult  ENT=Nymph  SHF=Egg";
    indicator.className = "lifestage-indicator";
  } else {
    indicator.classList.add("hidden");
  }

  updateHighlights();
  showToast(mode === "direct" ? "Direct key mode" : "Life stage mode");
}

function setActiveLifeStage(stage) {
  state.activeLifeStage = stage;
  const indicator = document.getElementById("lifestage-indicator");
  const labels = { adult: "ADULT", nymph: "NYMPH", egg: "EGG" };
  indicator.textContent = labels[stage] || stage.toUpperCase();
  indicator.className = `lifestage-indicator stage-${stage}`;
  updateHighlights();
}

function updateHighlights() {
  // Remove all highlights
  document.querySelectorAll(".stage-row").forEach(row => {
    row.classList.remove("highlight-adult", "highlight-nymph", "highlight-egg");
  });

  if (state.inputMode !== "lifestage" || !state.activeLifeStage) return;

  // Highlight matching rows across all columns
  document.querySelectorAll(".stage-row").forEach(row => {
    const species = SPECIES[row.dataset.species];
    if (!species) return;
    const matchedStage = findMatchingStage(species, state.activeLifeStage);
    if (matchedStage === row.dataset.stage) {
      row.classList.add(`highlight-${state.activeLifeStage}`);
    }
  });
}

// ============================================================
// ID Popup
// ============================================================

function openIdPopup(speciesId) {
  const species = SPECIES[speciesId];
  if (!species) return;

  state.idPopupOpen = speciesId;
  const popup = document.getElementById("id-popup");

  document.getElementById("id-popup-title").textContent = species.fullName || species.name;
  document.getElementById("id-popup-sci").textContent = species.scientificName || "";

  // Images
  const imgContainer = document.getElementById("id-popup-images");
  imgContainer.innerHTML = "";
  (species.idImages || []).forEach(img => {
    const fig = document.createElement("figure");
    fig.innerHTML = `<img src="${img.src}" alt="${img.caption}" style="cursor:pointer"><figcaption>${img.caption}</figcaption>`;
    fig.querySelector("img").addEventListener("click", () => openLightbox(img.src, img.caption));
    imgContainer.appendChild(fig);
  });

  // Notes
  const notesList = document.getElementById("id-popup-notes");
  notesList.innerHTML = "";
  (species.idNotes || []).forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);
  });

  // Citation
  const citEl = document.getElementById("id-popup-citation");
  if (species.citation) {
    if (species.citation.url) {
      citEl.innerHTML = `Source: <a href="${species.citation.url}" target="_blank" rel="noopener">${species.citation.source}</a>`;
    } else {
      citEl.textContent = `Source: ${species.citation.source}`;
    }
  } else {
    citEl.textContent = "";
  }

  popup.classList.remove("hidden");
  document.body.classList.add("popup-open");
}

function closeIdPopup() {
  state.idPopupOpen = null;
  document.getElementById("id-popup").classList.add("hidden");
  document.body.classList.remove("popup-open");
}

// ============================================================
// Export
// ============================================================

function exportCounts() {
  if (!hasAnyCounts()) { showToast("No counts to export"); return; }

  const lines = ["Species\tStage\tCount"];
  state.activeColumns.forEach(colId => {
    const species = SPECIES[colId];
    if (!species) return;
    Object.entries(species.stages).forEach(([stageKey, stage]) => {
      const count = state.counts[`${colId}.${stageKey}`] || 0;
      if (count > 0) {
        lines.push(`${species.fullName || species.name}\t${stage.label}\t${count}`);
      }
    });
  });

  const text = lines.join("\n");
  navigator.clipboard.writeText(text).then(() => {
    showToast("Counts copied to clipboard!");
  }).catch(() => {
    // Fallback: download as file
    const blob = new Blob([text], { type: "text/tab-separated-values" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `counts_${state.currentMode}_${new Date().toISOString().slice(0,10)}.tsv`;
    a.click();
    showToast("Counts downloaded as TSV");
  });
}

// ============================================================
// Add Column Modal
// ============================================================

function openAddModal() {
  const mode = MODES[state.currentMode];
  if (!mode) return;

  const list = document.getElementById("add-modal-list");
  list.innerHTML = "";

  // Collect all species for this mode that are not currently active
  // Includes: defaultColumns (removed ones), extraColumns, and availableExtras
  const allForMode = new Set([
    ...(mode.defaultColumns || []),
    ...(mode.extraColumns || []),
    ...(mode.availableExtras || []),
  ]);
  const allAvailable = [...allForMode].filter(id => !state.activeColumns.includes(id));

  if (allAvailable.length === 0) {
    list.innerHTML = '<div style="color:#999;font-size:0.9rem;">All species are already shown</div>';
  } else {
    // Group by category
    const groups = {};
    allAvailable.forEach(colId => {
      const species = SPECIES[colId];
      if (!species) return;
      const cat = species.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ id: colId, species });
    });

    const categoryLabels = { pest: "Pests", predator: "Predators / Beneficials", other: "Other" };
    const categoryOrder = ["pest", "predator", "other"];

    categoryOrder.forEach(cat => {
      if (!groups[cat] || groups[cat].length === 0) return;

      const sectionHeader = document.createElement("div");
      sectionHeader.className = "add-modal-section";
      sectionHeader.textContent = categoryLabels[cat] || cat;
      list.appendChild(sectionHeader);

      groups[cat].forEach(({ id: colId, species }) => {
        const item = document.createElement("div");
        item.className = "add-modal-item";
        item.innerHTML = `
          <span>${species.fullName || species.name}${species.scientificName ? ` <span class="sci">(${species.scientificName})</span>` : ""}</span>
          <span class="category-tag tag-${species.category}">${species.category}</span>
        `;
        item.addEventListener("click", () => addColumn(colId));
        list.appendChild(item);
      });
    });
  }

  document.getElementById("add-modal").classList.remove("hidden");
}

function closeAddModal() {
  document.getElementById("add-modal").classList.add("hidden");
}

function addColumn(speciesId) {
  if (state.activeColumns.includes(speciesId)) return;
  state.activeColumns.push(speciesId);

  const species = SPECIES[speciesId];
  if (species) {
    Object.keys(species.stages).forEach(sk => {
      state.counts[`${speciesId}.${sk}`] = 0;
    });
  }

  renderGrid();
  closeAddModal();
  showToast(`Added ${species ? species.name : speciesId}`);
}

function addCustomColumn() {
  const input = document.getElementById("custom-name");
  const name = input.value.trim();
  if (!name) return;

  const id = "custom_" + name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  // Create a custom species entry
  SPECIES[id] = {
    id: id,
    name: name,
    fullName: name,
    scientificName: "",
    category: "other",
    stages: {
      count: { label: "Count", directKey: null, image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  };

  addColumn(id);
  input.value = "";
}

// ============================================================
// Lightbox (fullscreen image viewer)
// ============================================================

function openLightbox(src, caption) {
  let overlay = document.getElementById("lightbox");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "lightbox";
    overlay.className = "lightbox";
    overlay.innerHTML = `
      <button class="lightbox-close">&times;</button>
      <img class="lightbox-img" src="" alt="">
      <div class="lightbox-caption"></div>
    `;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("lightbox-close")) {
        closeLightbox();
      }
    });
    document.body.appendChild(overlay);
  }
  overlay.querySelector(".lightbox-img").src = src;
  overlay.querySelector(".lightbox-img").alt = caption || "";
  overlay.querySelector(".lightbox-caption").textContent = caption || "";
  overlay.classList.remove("hidden");
  overlay.classList.add("visible");
}

function closeLightbox() {
  const overlay = document.getElementById("lightbox");
  if (overlay) {
    overlay.classList.remove("visible");
    overlay.classList.add("hidden");
  }
}

// ============================================================
// Toast
// ============================================================

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add("hidden"), 2000);
}
