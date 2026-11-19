# Coy Discover – Swipe-Based Profile Discovery App

A standalone swipe-based profile discovery application inspired by modern dating and social discovery platforms. Built as part of the Coy SDE Internship Assignment.

## Features

### Discover
- Browse mock user profiles one at a time.
- Swipe right to Like and left to Pass.
- Drag gestures supported for swipe interactions.
- Like and Pass buttons for desktop users.
- Profile cards with photos, age, bio, city, and interests.
- Smooth card animations and swipe feedback.
- Previously swiped profiles are not shown again.
- Empty state when no profiles remain.

### Matching
- Matches are created only when both users like each other.
- Displays an "It's a Match!" popup for mutual likes.
- Dedicated Matches section.
- One-sided likes are never exposed through the API.

### Data Persistence
- Stores profile information in JSON files.
- Saves Like and Pass actions.
- Persists mutual matches across page reloads and backend restarts.

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS
- Lucide React

**Backend**
- Node.js
- Express.js
- REST APIs

**Data Storage**
- JSON files

## Project Structure

```text
Coy-Discover/
├── backend/
│   ├── data/
│   │   ├── profiles.json
│   │   ├── swipes.json
│   │   └── matches.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
└── README.md
```

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/feed` | Returns profiles not yet swiped on |
| POST | `/swipe` | Records a Like or Pass and checks for a mutual match |
| GET | `/matches` | Returns mutual matches |

### Example POST /swipe request

```json
{
  "profileId": 2,
  "action": "like"
}
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/abhisheksingh667/coy-discover.git
cd coy-discover
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install backend dependencies

From the project root:

```bash
npm install
```

### 3. Seed mock profiles

```bash
npm run seed
```

This generates the mock profile data.

### 4. Start the backend

From the project root:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## Data Storage Notes

The application uses JSON-based file storage to persist profiles, swipes, and matches. It assumes a single logged-in user, as specified in the assignment.

## Assignment Context

This project was developed as a standalone implementation of the Discover tab described in the Coy SDE Internship Assignment. It uses mock profile data and does not require access to Coy's original codebase.

---

**Developed by Abhishek Singh**
