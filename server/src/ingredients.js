const items = [
  ["chicken-breast-cooked", "Chicken breast, meat only, roasted"],
  ["rice-white-cooked", "White rice, long-grain, enriched, cooked"],
  ["chickpeas-cooked", "Chickpeas, boiled, without salt"],
  ["lentils-cooked", "Lentils, boiled, without salt"],
  ["tomato-raw", "Tomato, red, ripe, raw"],
  ["onion-raw", "Onion, raw"],
  ["spinach-raw", "Spinach, raw"],
  ["potato-baked", "Potato, baked, flesh and skin, without salt"],
  ["egg-whole-raw", "Egg, whole, raw"],
  ["olive-oil", "Olive oil"],
  ["yogurt-plain-whole", "Yogurt, plain, whole milk"],
  ["milk-whole", "Milk, whole, without added vitamins A and D"],
  ["oats-raw", "Oats, dry"],
  ["apple-raw", "Apple, raw, with skin"],
  ["banana-raw", "Banana, raw"],
  ["carrot-raw", "Carrot, raw"],
  ["broccoli-raw", "Broccoli, raw"],
  ["flour-wheat-whole", "Whole wheat flour"]
];
export const ingredients = items.map(([id, name]) => ({ id, name }));
export const ingredientMap = new Map(ingredients.map(item => [item.id, item]));
