# Baker's Index

Initial skeleton of a SaaS app for bakers to manage their collection of formulas. Not yet deployed/deployable.

## Components/Services

- Auth0 for auth
- Using Neon and Neon local for development, will use for deployment but could be any Postgres service
- Typescript/React/Vite starter for the frontend
- Tailwind, Shadcn, Lucide icons for the frontend
- Go, GORM for the backend
- nodemon to run/reload the backend dev server
- Pulumi to deploy to
    - AWS Lambda
    - AWS static site
    - Neon
    - (maybe) Auth0
    - Custom domain names, staging domain

## Dev

Prerequisites:

1. A Neon account with an API key created.
2. Pulumi installed with some backend to store your stacks.
3. Auth0 configured with an API and an application (TODO: document this better, or get it into Pulumi too).

Then, in order, you can set up the following components.

### Neon

1. `cd bi-neon/`
2. `export NEON_API_KEY=<your API key>`
3. `nvm use`
4. `yarn install`
5. `pulumi up`
6. Note the staging branch ID for the next step.

### Local Backend

1. `cd bi-backend/`
2. Set up a neon.env with your Neon Local values (NEON_API_KEY, NEON_PROJECT_ID, PARENT_BRANCH_ID which should be the staging branch ID from the previous step).
3. Set up a .env.local (DATABASE_URL from the Neon Local documentation, AUTH0_DOMAIN and AUTH0_AUDIENCE from your Auth0 dashboard).
4. `export BI_BACKEND=local`
5. `nvm use`
6. `yarn install`
7. `./neon-local.sh` (keep this running)
8. Log in to Neon and get the connection string for your new branch with the connection pooler turned off; put this in a .env.nonpooled.local file.
9. `make migrate-local` (this should use your .env.nonpooled.local to connect to the Neon local DB and run the migrations; Atlas can't work with PgBoucer, hence the need for another connection string)
10. `./dev-server.sh` (keep this running too)

### Local Frontend

1. `cd bi-frontend/`
2. `nvm use`
3. `yarn install`
4. Set up a `.env.local` with all the `VITE_` environment variables (API_BASE should point to your dev backend, CALLBACK_URL should point to this frontend)
5. `yarn run dev` (keep this running)

### Deploy to staging

1. `cd bi-infrastructure/`
2. `nvm use`
... TODO finish this: backend .env.staging.local, migrate-staging, deploy staging
