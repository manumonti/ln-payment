# Bitcoin Lightning Network Payment Challenge

A full-stack application for Bitcoin Lightning Network payments between nodes. This project demonstrates end-to-end invoice generation, payment execution, and real-time status tracking using LND nodes within a Polar-simulated network.

![ln-payment-payment gif](https://github.com/user-attachments/assets/5c3663c7-f660-4d09-9cce-73a009cbe5c2)

## 📚 Documentation

For detailed information, please refer to the following guides:

- **[Setup & Run Guide](docs/setup.md)**: Detailed instructions on how to run the application.
- **[API Documentation](docs/api.md)**: Details of all REST endpoints available in the backend.
- **[Architecture](docs/architecture.md)**: In-depth look at the technology stack, system design, and database schema.

## 🛠 Features

- **Invoice Generation**: Create BOLT-11 invoices with custom amounts and memos.
- **Payment Execution**: Pay invoices from a different node with real-time status updates. Invoice decoding and validation is performed before payment execution.
- **Transaction History**: View past invoices and payments in a unified list with status updates. Transactions are persisted in the database.
- **Balance Tracking**: Real-time calculation of node balance based on local database records.
- **Real-time updates**: Frontend and Backend communicate via WebSockets to provide real-time updates on invoice and payment status.
- **RESTful API**: Backend server exposes a RESTful API for frontend and external applications.
- **Session tokens**: Backend server uses session tokens to connect to multiple LND nodes.
- **Reconnection on restart**: Connections to LND nodes automatically restored after server restart.
- **Dockerized Stack**: Easy deployment of Frontend, Backend, and PostgreSQL database with a single docker-compose command.
- **Docker networking**: Docker network configured to connect to LND nodes running in Polar.
- **DB management**: Easy access to the PostgreSQL database for monitoring and management through [pgAdmin](https://www.pgadmin.org/) web interface.

## 🏗 Tech Stack

- **Frontend**: Typescript,  [React](https://react.dev/) library, [Next.js](https://nextjs.org/) React framework, [Untitled.ui](https://www.untitledui.com/react) React components.
- **Backend**: Typescript, [Node.js](https://nodejs.org/) runtime environment, [Express](https://expressjs.com/) web application framework.
- **Database**: [PostgreSQL](https://www.postgresql.org/).
- **Lightning Network**: Simulated LND (Lightning Network Daemon) nodes via [Polar](https://lightningpolar.com/).
- **Code Style**: [ESLint](https://eslint.org/) code linter, [Prettier](https://prettier.io/) code formatter, [Husky](https://typicode.github.io/husky/) for pre-commit Git hook.
- **Testing**: [Jest](https://jestjs.io/) unit testing framework for backend.

## 📋 TODOs

- [ ] Add unit tests for frontend components
- [ ] Add e2e tests for frontend components
- [ ] Better error handling
- [ ] Better consistency between API endpoints responses
- [ ] Transactions and Balance pages are updated in real-time

## 📷 Screenshots

### Payment page

![ln-payment-payment gif](https://github.com/user-attachments/assets/5c3663c7-f660-4d09-9cce-73a009cbe5c2)

### Invoice page

![ln-payment-invoice gif](https://github.com/user-attachments/assets/ccabb62f-7e6b-413e-b024-f7d0e8e87f9f)

### Transactions page

<img width="1294" height="1074" alt="ln-payment-transactions" src="https://github.com/user-attachments/assets/4de1d55a-637b-4050-9d4c-7af3e9d7dab4" />

### Balance page

<img width="1250" height="1030" alt="ln-payment-balance" src="https://github.com/user-attachments/assets/c23a5374-b52b-4cb9-8d1e-55202f924f1f" />
