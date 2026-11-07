# PlateRemix

A recipe app built with React, Node.js, Express and MongoDB.

## Features

- Create an account and log in.
- Add recipes with ingredients, quantities, servings and cooking instructions.
- Search, edit and delete your saved recipes.
- Keep your recipe library private.

## Setup

Install Node.js 20 or newer and MongoDB Community Server. Make sure `mongod` is on your PATH.

Install the dependencies from the project folder:

```sh
npm ci --prefix server
npm ci --prefix client
```

Copy `server/.env.example` to `server/.env`. Set `JWT_SECRET` to a random value of at least 32 characters. Keep this file private.

## Run

Open three terminals in the project folder and run one command in each:

```sh
npm run db
```

```sh
npm run server
```

```sh
npm run dev
```

Open http://localhost:5173. Keep the terminals running while using the app. Press Ctrl+C to stop them.

MongoDB saves data in `.local/mongodb`. Restart the backend after changing its code.

## Checks

```sh
npm test --prefix server
npm test --prefix client
npm run build --prefix client
```

## Team

- Zulnoorain Ashfaq: backend, account authentication, recipe storage and integration.
- Ayesha Noor: React account screens, recipe builder, library and responsive interface.
