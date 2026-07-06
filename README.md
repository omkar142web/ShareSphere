# ShareSphere

Campus carpool ride-sharing app. Share rides, earn eco points, and reduce your carbon footprint.

## Tech Stack

- **Backend:** Express.js + EJS templating
- **Database:** MongoDB
- **Auth:** Cookie-based (plaintext)
- **Frontend:** Vanilla JS with glassmorphism UI

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment:

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/sharesphere
PORT=5000
```

3. Start the server:

```bash
npm start
```

Visit `http://localhost:5000`

## Project Structure

```
backend/
├── controllers/     # Route handlers
├── public/          # Static files (CSS, JS)
├── routes/          # Express route definitions
├── services/        # Database service layer
├── views/           # EJS templates
├── server.js        # Entry point
└── package.json
```

## Features

- User registration & login
- Post, join, and delete rides
- Eco score tracking
- Responsive dark-mode UI
