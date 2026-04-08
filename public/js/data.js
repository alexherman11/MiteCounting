// ============================================================
// Species & Mode Definitions for Mite Counter
// ============================================================

const SPECIES = {
  // ---- MITE PESTS ----
  tssm: {
    id: "tssm",
    name: "TSSM",
    fullName: "Two-Spotted Spider Mite",
    scientificName: "Tetranychus urticae",
    category: "pest",
    stages: {
      adult:  { label: "Adult",  directKey: "u", image: "images/mites/tssm/tssm_reference.png" },
      nymph:  { label: "Nymph",  directKey: "j", image: "images/mites/tssm/tssm_reference.png" },
      egg:    { label: "Egg",    directKey: "m", image: "images/mites/tssm/tssm_egg_nymph_adult_and_californicus.png" },
    },
    idNotes: [
      "Adults are green to orange, boxy shaped, with characteristic black spots on each side",
      "Spider mites have prominent hairs all over their body",
      "Shorter legs and move slower than predators",
      "Nymphs look like mini adults (very young ones may lack spots)",
      "Eggs are slightly orange to opaque white spheres (predator eggs are more ovoid)",
      "Typically found on the underside of leaves",
      "May produce webbing",
      "TSSM suck contents of plant cells, leading to discolored foliage",
      "TSSM can also be orange! Don't get it mixed up with Persimilis. Keep an eye out for the spots",
    ],
    idImages: [
      { src: "images/mites/tssm/tssm_orange_variant.jpeg", caption: "TSSM can also be orange" },
      { src: "images/mites/tssm/tssm_extra_spots.jpg", caption: "TSSM with extra spots on rear" },
      { src: "images/mites/tssm/tssm_egg_nymph_adult_and_californicus.png", caption: "TSSM egg, nymph, adult (also pictured: Californicus)" },
    ],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/agriculture/floriculture-and-ornamental-nurseries/twospotted-spider-mite/" },
  },

  lewis: {
    id: "lewis",
    name: "Lewis",
    fullName: "Lewis Spider Mite",
    scientificName: "Eotetranychus lewisi",
    category: "pest",
    stages: {
      adult:  { label: "Adult",  directKey: "i", image: "images/mites/lewis/lewis_vs_tssm_adults.jpg" },
      nymph:  { label: "Nymph",  directKey: "k", image: "images/mites/lewis/lewis_mite_nymph.jpg" },
      egg:    { label: "Egg",    directKey: ",", image: "images/mites/lewis/lewis_mite_reference.png" },
    },
    idNotes: [
      "Adults are smaller than TSSM",
      "They have black speckles rather than two clear large dots",
      "Narrower, may be lighter green than TSSM",
      "(Never is red?)",
    ],
    idImages: [
      { src: "images/mites/lewis/lewis_vs_tssm_adults.jpg", caption: "Upper: adult Lewis; Lower: TSSM" },
      { src: "images/mites/lewis/lewis_vs_tssm_nymphs.jpg", caption: "Upper: Lewis nymph; Lower: TSSM nymph" },
      { src: "images/mites/lewis/lewis_mite_nymph.jpg", caption: "Lewis mite nymph" },
    ],
    citation: { source: "UC IPM, Surendra Dara", url: "https://ipm.ucanr.edu/PMG/T/I-AC-TSPP-MC.016.html" },
  },

  // ---- MITE PREDATORS ----
  californicus: {
    id: "californicus",
    name: "Californicus",
    fullName: "Californicus",
    scientificName: "Neoseiulus californicus",
    category: "predator",
    stages: {
      adult:  { label: "Adult",  directKey: "o", image: "images/mites/californicus/californicus_adult_with_tssm_egg.png" },
      nymph:  { label: "Nymph",  directKey: "l", image: "images/mites/californicus/californicus_with_tssm.jpeg" },
      egg:    { label: "Egg",    directKey: ".", image: "images/mites/californicus/californicus_reference.jpeg" },
    },
    idNotes: [
      "Generalist predator on spider mites, other mites, thrips, and other small arthropods",
      "Adults have a mostly clear-light orange body with orange parentheses on its back",
      "Pear/teardrop shaped, larger than TSSM, shiny, long legged, and fast moving",
      "Nymphs are like smaller adults",
      "Larvae are 6-legged, translucent to transparent, and relatively inactive",
    ],
    idImages: [
      { src: "images/mites/californicus/californicus_adult_with_tssm_egg.png", caption: "Adult Californicus with TSSM egg" },
      { src: "images/mites/californicus/californicus_with_tssm.jpeg", caption: "Californicus with TSSM" },
    ],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/natural-enemies/neoseiulus-predatory-mites/" },
  },

  persimilis: {
    id: "persimilis",
    name: "Persimilis",
    fullName: "Persimilis",
    scientificName: "Phytoseiulus persimilis",
    category: "predator",
    stages: {
      adult:  { label: "Adult",  directKey: "p", image: "images/mites/persimilis/persimilis_reference.png" },
      nymph:  { label: "Nymph",  directKey: ";", image: "images/mites/persimilis/persimilis_reference.png" },
      egg:    { label: "Egg",    directKey: "/", image: "images/mites/persimilis/persimilis_egg_vs_tssm_egg.jpeg" },
    },
    idNotes: [
      "Specific predator on two-spotted spider mite",
      "Adults are pear/teardrop shaped, clear to reddish orange",
      "Slightly larger than TSSM, have longer legs, and move faster",
      "May be shinier than TSSM and less hairy",
      "Nymphs are like smaller adults, may be lighter color",
      "Eggs are oval, clear to somewhat orange and approximately twice as large as TSSM eggs",
    ],
    idImages: [
      { src: "images/mites/persimilis/persimilis_reference.png", caption: "Persimilis" },
      { src: "images/mites/persimilis/persimilis_egg_vs_tssm_egg.jpeg", caption: "Persimilis egg (left) vs TSSM egg (right)" },
      { src: "images/mites/persimilis/persimilis_vs_californicus.png", caption: "Persimilis vs Californicus" },
    ],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/natural-enemies/phytoseiulus-predatory-mites/" },
  },

  // ---- EXTRA MITE COUNTERS ----
  spider_mite_egg: {
    id: "spider_mite_egg",
    name: "SM Egg",
    fullName: "Spider Mite Egg",
    scientificName: "",
    category: "pest",
    stages: {
      egg: { label: "Egg", directKey: "n", image: "images/mites/tssm/tssm_egg_nymph_adult_and_californicus.png" },
    },
    idNotes: ["Generic spider mite egg counter (when species is uncertain)"],
    idImages: [],
    citation: null,
  },

  predator_egg: {
    id: "predator_egg",
    name: "Pred Egg",
    fullName: "Predator Egg",
    scientificName: "",
    category: "predator",
    stages: {
      egg: { label: "Egg", directKey: "h", image: "images/mites/persimilis/persimilis_egg_vs_tssm_egg.jpeg" },
    },
    idNotes: ["Generic predator egg counter (when species is uncertain)", "Predator eggs are more ovoid than spider mite eggs"],
    idImages: [],
    citation: null,
  },

  red_persimilis: {
    id: "red_persimilis",
    name: "Red Pers.",
    fullName: "Red Persimilis",
    scientificName: "Phytoseiulus persimilis",
    category: "predator",
    stages: {
      adult: { label: "Adult", directKey: "y", image: "images/mites/persimilis/persimilis_reference.png" },
    },
    idNotes: ["Red color variant of Persimilis"],
    idImages: [],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/natural-enemies/phytoseiulus-predatory-mites/" },
  },

  white_persimilis: {
    id: "white_persimilis",
    name: "White Pers.",
    fullName: "White Persimilis",
    scientificName: "Phytoseiulus persimilis",
    category: "predator",
    stages: {
      adult: { label: "Adult", directKey: "g", image: "images/mites/persimilis/persimilis_reference.png" },
    },
    idNotes: ["White/clear color variant of Persimilis"],
    idImages: [],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/natural-enemies/phytoseiulus-predatory-mites/" },
  },

  // ---- WHITEFLY ----
  whitefly: {
    id: "whitefly",
    name: "Whitefly",
    fullName: "Silverleaf Whitefly",
    scientificName: "Bemisia tabaci",
    category: "pest",
    stages: {
      adult:  { label: "Adult",  directKey: null, image: "images/mites/whitefly/whitefly_adults_shells_pupa.jpeg" },
      nymph:  { label: "Nymph",  directKey: null, image: "images/mites/whitefly/whitefly_immature_life_stages.png" },
      egg:    { label: "Egg",    directKey: null, image: "images/mites/whitefly/whitefly_immature_life_stages.png" },
    },
    idNotes: [
      "Larvae and pupa lack antennae and legs and are flat against the bottom of the leaf",
      "Pupa have visible red eyes",
      "Empty shells have a t-shaped slit and are white/clear (adult already emerged)",
      "Eggs are tiny and very oval shaped, may be laid in a circle",
      "Adults are white, with wings, antennae, legs, and red eyes",
    ],
    idImages: [
      { src: "images/mites/whitefly/whitefly_adults_shells_pupa.jpeg", caption: "Whitefly adults, empty shells, and pupa" },
      { src: "images/mites/whitefly/whitefly_immature_life_stages.png", caption: "Whitefly immature life stages" },
    ],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/agriculture/potato/silverleaf-whitefly/" },
  },

  // ---- APHIDS ----
  green_peach_aphid: {
    id: "green_peach_aphid",
    name: "GPA",
    fullName: "Green Peach Aphid",
    scientificName: "Myzus persicae",
    category: "pest",
    stages: {
      adult: { label: "Adult", directKey: null, image: "images/mites/green_peach_aphid/green_peach_aphid_1.png" },
    },
    idNotes: [
      "Green to greenish yellow and more streamlined than the rounded cotton aphid",
      "Winged adults typically have a black spot on the top of the abdomen",
    ],
    idImages: [
      { src: "images/mites/green_peach_aphid/green_peach_aphid_1.png", caption: "Green Peach Aphid" },
      { src: "images/mites/green_peach_aphid/green_peach_aphid_2.jpeg", caption: "Green Peach Aphid" },
    ],
    citation: { source: "David Headrick", url: null },
  },

  cotton_aphid: {
    id: "cotton_aphid",
    name: "Cotton Aphid",
    fullName: "Cotton Aphid",
    scientificName: "Aphis gossypii",
    category: "pest",
    stages: {
      adult: { label: "Adult", directKey: null, image: "images/mites/cotton_aphid/cotton_aphid_1.png" },
    },
    idNotes: [
      "Highly variable in body size and color",
      "Nymphs and adults of wingless cotton aphids vary from yellow to green to nearly black",
      "Winged form have a dusty wax coating, typically greenish blue or amber and blue",
    ],
    idImages: [
      { src: "images/mites/cotton_aphid/cotton_aphid_1.png", caption: "Cotton Aphid" },
      { src: "images/mites/cotton_aphid/cotton_aphid_2.jpeg", caption: "Cotton Aphid" },
    ],
    citation: { source: "UC IPM", url: "https://ipm.ucanr.edu/agriculture/cotton/cotton-aphid/" },
  },

  // ---- SWD MODE SPECIES ----
  swd: {
    id: "swd",
    name: "SWD",
    fullName: "Spotted Wing Drosophila",
    scientificName: "Drosophila suzukii",
    category: "pest",
    stages: {
      male:   { label: "Male",   directKey: "u", image: null },
      female: { label: "Female", directKey: "j", image: null },
    },
    idNotes: ["Males have a dark spot on each wing"],
    idImages: [],
    citation: null,
  },

  d_melanogaster: {
    id: "d_melanogaster",
    name: "D. melanogaster",
    fullName: "Common Fruit Fly",
    scientificName: "Drosophila melanogaster",
    category: "other",
    stages: {
      male:   { label: "Male",   directKey: "i", image: null },
      female: { label: "Female", directKey: "k", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },

  l_japonica: {
    id: "l_japonica",
    name: "L. japonica",
    fullName: "Leptopilina japonica",
    scientificName: "Leptopilina japonica",
    category: "predator",
    stages: {
      male:   { label: "Male",   directKey: "o", image: null },
      female: { label: "Female", directKey: "l", image: null },
    },
    idNotes: ["Parasitoid wasp of SWD"],
    idImages: [],
    citation: null,
  },

  l_heterotoma: {
    id: "l_heterotoma",
    name: "L. heterotoma",
    fullName: "Leptopilina heterotoma",
    scientificName: "Leptopilina heterotoma",
    category: "predator",
    stages: {
      male:   { label: "Male",   directKey: "p", image: null },
      female: { label: "Female", directKey: ";", image: null },
    },
    idNotes: ["Parasitoid wasp of Drosophila"],
    idImages: [],
    citation: null,
  },

  p_vindemmiae: {
    id: "p_vindemmiae",
    name: "P. vindemmiae",
    fullName: "Pachycrepoideus vindemmiae",
    scientificName: "Pachycrepoideus vindemmiae",
    category: "predator",
    stages: {
      male:   { label: "Male",   directKey: "y", image: null },
      female: { label: "Female", directKey: "h", image: null },
    },
    idNotes: ["Parasitoid wasp"],
    idImages: [],
    citation: null,
  },

  t_drosophilae: {
    id: "t_drosophilae",
    name: "T. drosophilae",
    fullName: "Trichopria drosophilae",
    scientificName: "Trichopria drosophilae",
    category: "predator",
    stages: {
      male:   { label: "Male",   directKey: "t", image: null },
      female: { label: "Female", directKey: "g", image: null },
    },
    idNotes: ["Parasitoid wasp of Drosophila"],
    idImages: [],
    citation: null,
  },

  // ---- LYGUS MODE SPECIES ----
  lygus: {
    id: "lygus",
    name: "Lygus",
    fullName: "Lygus Bug",
    scientificName: "Lygus spp.",
    category: "pest",
    stages: {
      adult:       { label: "Adult",        directKey: "u", image: null },
      large_nymph: { label: "Large Nymph",  directKey: "j", image: null },
      small_nymph: { label: "Small Nymph",  directKey: "m", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },

  lygus_swd: {
    id: "lygus_swd",
    name: "SWD",
    fullName: "Spotted Wing Drosophila",
    scientificName: "Drosophila suzukii",
    category: "pest",
    stages: {
      male:   { label: "Male",   directKey: "i", image: null },
      female: { label: "Female", directKey: "k", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },

  common_drosophila: {
    id: "common_drosophila",
    name: "Common Dros.",
    fullName: "Common Drosophila",
    scientificName: "Drosophila spp.",
    category: "other",
    stages: {
      count: { label: "Count", directKey: "o", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },

  minute_pirate_bug: {
    id: "minute_pirate_bug",
    name: "MPB",
    fullName: "Minute Pirate Bug",
    scientificName: "Orius spp.",
    category: "predator",
    stages: {
      count: { label: "Count", directKey: "p", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },

  lacewing: {
    id: "lacewing",
    name: "Lacewing",
    fullName: "Lacewing",
    scientificName: "Chrysoperla spp.",
    category: "predator",
    stages: {
      count: { label: "Count", directKey: "l", image: null },
    },
    idNotes: [],
    idImages: [],
    citation: null,
  },
};

// ============================================================
// Mode Definitions - which species columns appear in each mode
// ============================================================

const MODES = {
  mites: {
    id: "mites",
    name: "Mites",
    icon: "🔬",
    description: "Spider mite & predator counting",
    defaultColumns: ["tssm", "lewis", "californicus", "persimilis"],
    extraColumns: [],
    availableExtras: ["spider_mite_egg", "predator_egg", "red_persimilis", "white_persimilis", "whitefly", "green_peach_aphid", "cotton_aphid"],
    // Life-stage mode column keys (maps key -> column ID)
    lifeStageKeys: { "u": "tssm", "i": "lewis", "o": "californicus", "p": "persimilis" },
  },
  swd: {
    id: "swd",
    name: "SWD",
    icon: "🪰",
    description: "Spotted Wing Drosophila counting",
    defaultColumns: ["swd", "d_melanogaster", "l_japonica", "l_heterotoma", "p_vindemmiae", "t_drosophilae"],
    extraColumns: [],
    availableExtras: [],
    lifeStageKeys: { "u": "swd", "i": "d_melanogaster", "o": "l_japonica", "p": "l_heterotoma", "y": "p_vindemmiae", "t": "t_drosophilae" },
  },
  lygus: {
    id: "lygus",
    name: "Lygus",
    icon: "🌿",
    description: "Lygus bug counting",
    defaultColumns: ["lygus", "lygus_swd", "common_drosophila", "minute_pirate_bug", "lacewing"],
    extraColumns: [],
    availableExtras: [],
    lifeStageKeys: { "u": "lygus", "i": "lygus_swd", "o": "common_drosophila", "p": "minute_pirate_bug", "l": "lacewing" },
  },
};

// Per-column color palette -- fun but professional
const COLUMN_PALETTE = [
  { bg: "#E0F2F1", border: "#009688", header: "#00695C", accent: "#4DB6AC" },  // teal
  { bg: "#FBE9E7", border: "#FF5722", header: "#BF360C", accent: "#FF8A65" },  // coral
  { bg: "#EDE7F6", border: "#673AB7", header: "#4527A0", accent: "#9575CD" },  // indigo
  { bg: "#FFF8E1", border: "#FFB300", header: "#E65100", accent: "#FFD54F" },  // amber
  { bg: "#E8F5E9", border: "#43A047", header: "#1B5E20", accent: "#81C784" },  // sage
  { bg: "#F3E5F5", border: "#AB47BC", header: "#6A1B9A", accent: "#CE93D8" },  // plum
  { bg: "#E1F5FE", border: "#0288D1", header: "#01579B", accent: "#4FC3F7" },  // sky
  { bg: "#FCE4EC", border: "#E91E63", header: "#880E4F", accent: "#F48FB1" },  // rose
  { bg: "#E0F7FA", border: "#00ACC1", header: "#006064", accent: "#4DD0E1" },  // mint
  { bg: "#ECEFF1", border: "#546E7A", header: "#37474F", accent: "#90A4AE" },  // slate
  { bg: "#EDE7F6", border: "#7E57C2", header: "#512DA8", accent: "#B39DDB" },  // lavender
  { bg: "#FFF3E0", border: "#FB8C00", header: "#E65100", accent: "#FFB74D" },  // peach
];

// Legacy category colors (used for add-modal badges)
const CATEGORY_COLORS = {
  pest:     { bg: "#FFF3E0", border: "#FF9800", header: "#E65100", accent: "#FFB74D" },
  predator: { bg: "#E8F5E9", border: "#4CAF50", header: "#1B5E20", accent: "#81C784" },
  other:    { bg: "#E3F2FD", border: "#2196F3", header: "#0D47A1", accent: "#64B5F6" },
};
