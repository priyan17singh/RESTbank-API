# RESTbank-API

A secure and scalable RESTful banking API built with Node.js, Express, and MongoDB. It provides core banking functionalities including user authentication, account management, and fund transfers with robust transaction handling.

---

## 🚀 Features

- **User Authentication** – Register, login, and logout with JWT stored in HTTP‑only cookies.
- **Account Management** – Create and view bank accounts (supports multiple accounts per user).
- **Secure Transactions** – Transfer funds between accounts with:
  - **Idempotency** – Prevent duplicate transactions using a unique key.
  - **Atomic Updates** – MongoDB transactions ensure debit/credit operations are consistent.
  - **Ledger-Based Accounting** – Every movement is recorded as a ledger entry for full auditability.
  - **Email Notifications** – Automatic alerts for successful or failed transfers.
- **System Administration** – Special endpoint to credit funds to any account (for system users).
- **Token Blacklisting** – Logout invalidates the JWT immediately.

---

## 🛠️ Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Runtime      | Node.js                            |
| Framework    | Express                            |
| Database     | MongoDB (Mongoose ODM)             |
| Authentication| JWT, bcryptjs, cookie-parser      |
| Email        | Nodemailer                         |
| Environment  | dotenv                             |
| Development  | Nodemon                            |

---

## 📦 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- A Gmail account (or other SMTP provider) for email notifications

---

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/priyan17singh/RESTbank-API.git
   cd RESTbank-API
  

---



2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following:

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

## 3. Start the Server

  ```bash
  # Development
  npm run dev

  # Production
  npm start
  ```

---

# 📚 API Documentation

- All endpoints are prefixed with `/api`.
- The API uses **JSON** for request and response bodies.
- Authentication is handled via **HTTP-only cookies**. The JWT token cookie is automatically set after a successful login.

---

# 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/register` | Register a new user | `{ name, email, password }` | User object (without password) |
| `POST` | `/login` | Log in and set JWT cookie | `{ email, password }` | `{ message, user }` |
| `POST` | `/logout` | Log out (blacklists token) | — | `{ message }` |

---

# 👤 Account Routes (`/api/account`)

| Method | Endpoint | Description | Request Body / Query | Response |
|--------|----------|-------------|----------------------|----------|
| `GET` | `/myAccounts` | Get all accounts of the authenticated user | — | Array of accounts |
| `GET` | `/balance` | Get balance of a specific account | `{ accountId }` | `{ balance }` |
| `POST` | `/create` | Create a new bank account | `{ currency }` *(optional, default: INR)* | Created account object |

---

# 💸 Transaction Routes (`/api/transactions`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/create` | Transfer funds between accounts | `{ fromAccount, toAccount, amount, idempotencyKey }` | `{ transaction, status }` |
| `POST` | `/system/initiate-funds` | **System-only:** Credit funds to an account | `{ accountId, amount, description }` | `{ message, ledgerEntry }` |

> **Note:**  
> The `/system/initiate-funds` endpoint is protected by a special `authSystemMiddleware`. Only users with the `systemUser` privilege can access this endpoint.

---

# 📌 Example Request — Transfer Funds

### Request

```http
POST /api/transactions/create
Cookie: token=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "fromAccount": "65f2a1b2c3d4e5f6a7b8c9d0",
  "toAccount": "65f2a1b2c3d4e5f6a7b8c9d1",
  "amount": 100.50,
  "idempotencyKey": "unique-uuid-1234"
}
```

### Successful Response

```json
{
  "transaction": {
    "id": "65f2a1b2c3d4e5f6a7b8c9d2",
    "status": "COMPLETED",
    "amount": 100.50,
    "fromAccount": "...",
    "toAccount": "..."
  }
}
```

---

# ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port on which the server runs (default: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `EMAIL_USER` | Email address used for sending notifications |
| `CLIENT_ID` | Google cloud client id |
| `CLIENT_SECRET` | Google cloud client secret |
| `REFRESH_TOKEN` | Gmail api refresh token |

---

# 🧪 Running Tests

Currently, no automated test suite has been implemented.

Contributions are welcome! Feel free to add:

- Unit Tests
- Integration Tests
- API Tests

---

# 🤝 Contributing

Contributions are always welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add some feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🙌 Acknowledgements

- Built as a learning project by **Priyanshu Singh**.
- Inspired by real-world banking system requirements.

---

## ⚠️ Disclaimer

This API is intended for **educational and demonstration purposes only**. It is **not production-ready out of the box**. Before deploying to a live environment, review and improve:

- Security practices
- Error handling
- Logging
- Performance optimizations
- Testing
- Monitoring
- Deployment configuration