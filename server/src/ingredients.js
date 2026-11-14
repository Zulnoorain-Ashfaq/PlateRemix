const items = [
  ["chicken-breast-cooked", "Chicken breast, meat only, roasted", 165, 31.02, 0, 171477],
  ["rice-white-cooked", "White rice, long-grain, enriched, cooked", 130, 2.69, 0.4, 168878],
  ["chickpeas-cooked", "Chickpeas, boiled, without salt", 164, 8.86, 7.6, 173757],
  ["lentils-cooked", "Lentils, boiled, without salt", 116, 9.02, 7.9, 172421],
  ["tomato-raw", "Tomato, red, ripe, raw", 18, 0.88, 1.2, 170457],
  ["onion-raw", "Onion, raw", 40, 1.1, 1.7, 170000],
  ["spinach-raw", "Spinach, raw", 23, 2.86, 2.2, 168462],
  ["potato-baked", "Potato, baked, flesh and skin, without salt", 93, 2.5, 2.2, 170093],
  ["egg-whole-raw", "Egg, whole, raw", 143, 12.56, 0, 171287],
  ["olive-oil", "Olive oil", 884, 0, 0, 171413],
  ["yogurt-plain-whole", "Yogurt, plain, whole milk", 61, 3.47, 0, 171284],
  ["milk-whole", "Milk, whole, without added vitamins A and D", 61, 3.15, 0, 172217],
  ["oats-raw", "Oats, dry", 389, 16.89, 10.6, 169705],
  ["apple-raw", "Apple, raw, with skin", 52, 0.26, 2.4, 171688],
  ["banana-raw", "Banana, raw", 89, 1.09, 2.6, 173944],
  ["carrot-raw", "Carrot, raw", 41, 0.93, 2.8, 170393],
  ["broccoli-raw", "Broccoli, raw", 34, 2.82, 2.6, 170379],
  ["flour-wheat-whole", "Whole wheat flour", 340, 13.21, 10.7, 168893]
];
export const ingredients = items.map(([id, name, calories, protein, fibre, fdcId]) => ({ id, name, calories, protein, fibre, fdcId, source: `USDA FoodData Central SR Legacy, April 2018: https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients` }));
export const ingredientMap = new Map(ingredients.map(item => [item.id, item]));
