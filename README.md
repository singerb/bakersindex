# Baker's Index

Initial skeleton of a SaaS app for bakers to manage their collection of formulas. Not yet deployed/deployable.

## Components/Services

- Auth0 for auth
- Using Neon and Neon local for development, will use for deployment but could be any Postgres service
- Typescript/React/Vite starter for the frontend
- Tailwind, Shadcn, Lucide icons for the frontend
- Go, GORM for the backend
- nodemon to run/reload the backend dev server
- (Eventually) Pulumi to deploy to
    - AWS Lambda
    - AWS static site
    - Neon
    - Auth0
    - Custom domain names, staging domain

## Dev

### Frontend

- `nvm use`
- `yarn install`
- Set up a `.env.local` with all the `VITE_` environment variables (backend server, Auth0 variables).
- `yarn run dev`

### Backend

- If using Neon local, set up a neon.env with your Neon local values
- Set up a .env.local (database URL, Auth0 variables)
- `export BI_BACKEND=local`
- `nvm use`
- `yarn install`
- `./dev-server.sh`
- (optional) `./neon-local.sh`
