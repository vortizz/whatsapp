# WhatsApp Showcase

This repository contains a showcase chat application with:

- `backend`: NestJS API
- `fe`: Nuxt 3 frontend
- `mongo`: MongoDB database via Docker Compose

## Run With Docker

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://mongoadmin:admin123@localhost:27017`

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
