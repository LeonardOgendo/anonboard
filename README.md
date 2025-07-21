## 🧵 Anonboard — Anonymous Message Board Microservice

A secure, modular, and production-ready anonymous message board built with Node.js, Express, MongoDB and React — designed to let users post and engage in anonymous threads with clean RESTful APIs and a Responsive UI.

> Originally inspired by the freeCodeCamp InfoSec curriculum, now refactored for real-world usability and scalability.

---

### 🚀 Features

- 🧾 Post and read anonymous threads
- 💬 Reply to threads anonymously
- 🗑 Edit or delete your own threads and replies
- 🚩 Report inappropriate threads or replies
- 🔎 Search threads by title
- 📜 View recent or all threads (paginated)
- 📦 Built using feature-based architecture (SOLID-principled)
- 🌐 Exposes a clean REST API for frontend or external use
- 🛡 Hardened with secure headers, input sanitization, and rate limiting
- ⚙️ Ready for cloud deployment on platforms like Railway, Render, or Fly.io

---


### 🔐 Security Features

- Helmet for secure HTTP headers
- `xss-clean` or `sanitize-html` to prevent XSS
- Express-rate-limit to prevent abuse (per IP)
- Input validation with express-validator / Zod
- Secrets and DB credentials stored in `.env`

---

## 🛠 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- RESTful API design
- React.js Frontend

---

## 📦 Status

- ✅ Legacy FCC version complete and passing tests
- 🔧 Refactoring underway into modular fullstack app
- 🔜 Frontend integration + production deployment coming soon

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and contribute.

---
