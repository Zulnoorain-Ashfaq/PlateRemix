# PlateRemix

PlateRemix is a recipe app built with React, Express, Node.js and MongoDB. Save recipes in your private library, make a remix and compare what changed. The app estimates calories, protein and fibre for the whole recipe and per serving using [USDA FoodData Central](https://fdc.nal.usda.gov/download-datasets/).

## Run it locally

Install Node.js 20 or newer and MongoDB Community Server. Make sure `mongod` is on your PATH.

```sh
npm ci --prefix server
npm ci --prefix client
```

Copy `server/.env.example` to `server/.env`. Set `JWT_SECRET` to a random value of at least 32 characters.

Run one command per terminal from the project folder:

```sh
npm run db
npm run server
npm run dev
```

Open [localhost:5173](http://localhost:5173). Sign up, save a recipe and click **Create a remix**. Change an ingredient to see the comparison update. You can save both versions and open them later from **My library**.

## Tests

```sh
npm test --prefix server
npm test --prefix client
```

## Team

- Zulnoorain Ashfaq: API, MongoDB and nutrition calculations.
- Ayesha Noor: recipe editor, comparison screen and library.
