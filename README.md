# WhatsApp Showcase

This repository contains a showcase chat application with:

- `backend`: NestJS API
- `fe`: Nuxt 3 frontend
- `mongo`: MongoDB database via Docker Compose

## Run With Docker

The default Docker Compose setup runs the frontend and backend in watch mode with bind mounts, so code changes are reflected automatically.
Server-side requests from Nuxt use the Docker service name `backend`, while browser requests still use `localhost`.

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- WebSocket: `ws://localhost:3000/entrypoint`
- MongoDB: `mongodb://mongoadmin:admin123@localhost:27017`

If the containers were already created before this change, recreate them once:

```bash
docker compose down
docker compose up --build
```

## Stop

```bash
docker compose down
```

To remove the database volume too:

```bash
docker compose down -v
```

## Environment

The Docker setup uses a single root env file:

```bash
cp .env.example .env
```

Default values are suitable for local showcase use only.
