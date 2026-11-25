// recipes.js — the Copper Ladle menu: ingredients, prep steps and dishes.
// Every dish is a list of steps; a step names an ingredient and the station
// work it needs first (none, chopped on the board, or grilled on the stove),
// so dishes share ingredients but send the cook down different routes.

export const INGREDIENTS = {
  bun:    { label: 'Bun',    color: '#e8b96a', dark: '#c08f3e' },
  patty:  { label: 'Patty',  color: '#8a4b2a', dark: '#5f3018' },
  cheese: { label: 'Cheese', color: '#f6c945', dark: '#d9a41f' },
  tomato: { label: 'Tomato', color: '#e2483a', dark: '#b02a20' },
  greens: { label: 'Greens', color: '#58a34c', dark: '#3a7431' },
  egg:    { label: 'Egg',    color: '#fdf3d8', dark: '#e3cf9a' },
  potato: { label: 'Potato', color: '#d9b380', dark: '#b18c54' },
  onion:  { label: 'Onion',  color: '#e9e2f2', dark: '#b9a8d4' },
};

// prep: 'raw' goes straight on the plate, 'chop' needs the board, 'grill' the stove.
export const RECIPES = [
  {
    name: 'Ember Burger',
    price: 14,
    steps: [
      { ing: 'bun', prep: 'raw' },
      { ing: 'patty', prep: 'grill' },
      { ing: 'cheese', prep: 'raw' },
      { ing: 'tomato', prep: 'chop' },
    ],
  },
  {
    name: 'Garden Melt',
    price: 11,
    steps: [
      { ing: 'bun', prep: 'raw' },
      { ing: 'cheese', prep: 'raw' },
      { ing: 'tomato', prep: 'chop' },
      { ing: 'greens', prep: 'chop' },
    ],
  },
  {
    name: 'Sunrise Skillet',
    price: 12,
    steps: [
      { ing: 'egg', prep: 'grill' },
      { ing: 'patty', prep: 'grill' },
      { ing: 'onion', prep: 'chop' },
    ],
  },
  {
    name: 'Orchard Hash',
    price: 10,
    steps: [
      { ing: 'potato', prep: 'chop' },
      { ing: 'onion', prep: 'chop' },
      { ing: 'egg', prep: 'grill' },
    ],
  },
  {
    name: 'Verdant Stack',
    price: 13,
    steps: [
      { ing: 'bun', prep: 'raw' },
      { ing: 'greens', prep: 'chop' },
      { ing: 'cheese', prep: 'raw' },
      { ing: 'patty', prep: 'grill' },
      { ing: 'tomato', prep: 'chop' },
    ],
  },
];

export function recipeByName(name) {
  return RECIPES.find((r) => r.name === name);
}

// How many distinct stations a dish sends the cook to — a quick depth gauge
// the order board could sort by, and a fair summary of a recipe's route.
export function recipeRouteLength(recipe) {
  const stations = new Set(recipe.steps.map((s) => s.prep));
  return stations.size + recipe.steps.length;
}
