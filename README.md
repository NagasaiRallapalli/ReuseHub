# ReuseHub

ReuseHub is an industrial reusable-material marketplace with a React frontend
and an Express/MongoDB backend.

## Project structure

- `frontend/` contains the Vite/React application.
- `backend/` contains the Express API, MongoDB models, and backend environment.

## Run the backend

```powershell
npm run backend
```

Set `MONGODB_URI` and `JWT_SECRET` in `backend/.env` before starting the API.
The backend listens on port `5000` by default.

## Run the frontend

From the project root:

```powershell
npm run dev
```

Open the local URL printed by Vite. The frontend connects to the API at
`http://localhost:5000`. The root npm scripts delegate to the corresponding
frontend scripts; install frontend dependencies with `cd frontend; npm install`
if needed.

## Build and lint the frontend

Run these commands from the project root:

```powershell
npm run build
npm run lint
```
