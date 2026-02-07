# ⚔️ Code-Arena

**Code-Arena** is a real-time competitive programming platform built to help developers sharpen their DSA skills through head-to-head battles and global contests.

Built with the **MERN Stack** and **Docker**, it features a secure, isolated code execution engine, an Elo-based rating system, and now—**Live Contests**.

<img width="1906" height="869" alt="image" src="https://github.com/user-attachments/assets/79135f31-b8f5-4f09-8675-0d2f8149bb6a" />
---

## 🚀 Key Features

### 🏆 Live Contests (New!)
* **Real-Time Participation:** Compete in scheduled global coding contests against the entire community.
* **Dynamic Leaderboards:** Watch rankings update live as participants submit solutions.
* **Contest Ratings:** Separate rating performance for contest standings.

### ⚔️ 1v1 Battles
* **Instant Matchmaking:** Find opponents with a similar skill level (Elo Rating ±200).
* **Real-Time Duels:** Solve algorithmic problems against an opponent with a live progress tracker.
* **Game Management:** 30-minute timer, auto-submission on timeout, and ability to rejoin active games within 1 hour.

### 🛡️ Secure Code Execution
* **Dockerized Environment:** User code is executed in isolated Docker containers to prevent malicious activity.
* **Judge Engine:** Validates solutions against multiple test cases with strict time and memory limits.
* **Multi-Language Support:** (Add languages here, e.g., C++, Java, Python, JavaScript).

### 👑 Administration
* **Problem Management:** Admin dashboard to add problems, test cases, and reference solutions.
* **Contest Creation:** Schedule and manage live contests.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS (or your preferred styling)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Real-time Communication:** Socket.io (for matchmaking, live leaderboards, and battle updates)
* **Code Execution:** Docker, BullMQ (for queuing submissions)
* **Authentication:** JWT / Clerk (Optional)

---

## 🏗️ Architecture

The application consists of three main services:

1.  **Client (Frontend):** Handles user interaction, code editor (Monaco/Ace), and WebSocket connections.
2.  **API Server (Backend):** Manages users, matchmaking logic, contest scheduling, and database operations.
3.  **Worker (Executor):** A separate service that pulls submissions from a queue, spins up Docker containers, executes code, and returns the verdict.

---

## ⚙️ Installation & Setup

Prerequisites:
* Node.js & npm/yarn
* Docker Desktop (running)
* MongoDB (local or Atlas)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/code-arena.git](https://github.com/yourusername/code-arena.git)
cd code-arena
