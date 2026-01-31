# Setup Guide

This guide will help you set up the development environment and run the application.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose.
- [Polar](https://lightningpolar.com/) for Lightning Network simulation.
- [Node.js](https://nodejs.org/) [optional] for local development without Docker.

## Polar Network Setup

Polar is a one-click Bitcoin Lightning Network development environment.

This application uses a running instance of Polar to simulate a Lightning Network with two nodes, Alice and Bob, where Alice generates invoices and Bob pays them.

The simulated Lightning Network requires:

- LND node: Alice (receiver)
- LND node: Bob (sender)
- Bitcoin Core node
- A channel between Alice and Bob
- A deposit of 1,000,000 sats on Bob.

To have this network created automatically, you can import the [ln-payment.polar](../ln-payment.polar) file into Polar.

1. **Install Polar**. Download and install Polar from [lightningpolar.com](https://lightningpolar.com/).

2. **Open Polar** and import the network using the [ln-payment.polar](../ln-payment.polar) file.

3. **Start the network**: Click the "Start" button in Polar.

> Note that the application will require the node credentials to connect to the nodes. Using the example `.env` files provided in the frontend [.env.local.example](../frontend/.env.local.example) will fill automatically the node credentials on the "Connect to a Node" page (more information below) for the imported network. Alternatively, you can get this credentials from Polar by clicking on a node and then on the "Connect" tab.

## Running the Application

### 1. Environment Variables

Copy the two example environment files.

```bash
# Environment variables used by docker-compose and backend
cp .env.example .env
# Environment variables used by frontend
cp frontend/.env.local.example frontend/.env.local
```

> Note that the environment variables used by the frontend will fill the form in the "Connect to a Node" modal with the node credentials for the imported network. This is a little help for debugging purposes, but you can use other credentials if you want.

### 2. Run with Docker Compose

The easiest way to run the entire stack (backend, frontend, database) is using Docker Compose:

```bash
docker-compose up --build
```

This will start, by default:

- **Frontend**: [http://localhost:4000](http://localhost:4000)
- **Backend**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)

### 3. Using the Application

1. Open [http://localhost:4000](http://localhost:4000) in your browser.
2. Transactions and Balances cards will redirect you to pages with that information.
3. Receiver card will redirect you to the receiver page, where you can connect to alice LND node, see the previous generated invoices and create new ones.
4. Sender card will redirect you to the sender page, where you can connect to bob LND node, see the previous payments and create new ones.

## Contributing

If you want to contribute to the project, or just want to run the components manually, you can follow the instructions below.

### Lightning Network

The Lightning Network must be run as described above through Polar.

### Postgres Database

1. Postgres database must be running. The easies way is to comment out the `backend` and `frontend` services in the [compose.yaml](../compose.yaml) file and run `docker-compose up --build`.
2. pgAdmin dashboard is available at [http://localhost:5050](http://localhost:5050). Create a new server connection with the following credentials:

- Name: `<whatever you want>`
- Host name/address: `postgres`. This will use Docker networking to connect to the database container.
- Port: `5432`
- Maintenance database: `postgres`
- Username: `admin`
- Password: `admin`

### Backend

1. In .env file, the `POSTGRES_HOST` variable must be commented out, so the backend will use the default `localhost` instead of the one provided by Docker.
2. Run the backend server:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. You can check if it's running by calling to some GET endpoint:

   ```bash
   curl http://localhost:3000/api/balance
   ```

### Frontend

1. Run the frontend server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Access with the browser to [http://localhost:4000](http://localhost:4000).

## Environment variables

Environment variables are used to configure the application. You can find the environment variables in the `.env` files. The following environment variables are used by the application:

[.env](../.env):

- `FRONTEND_PORT`: The port that frontend server will expose.
- `SERVER_PORT`: The port that backend server will expose.
- `POSTGRES_HOST`: The host of the PostgreSQL database. If you are running the database locally, this should commented out since the set value `postgres` is the name of the Docker container running the database so Docker network will resolve it to the container IP address.
- `POSTGRES_PORT`: The port of the PostgreSQL database.
- `POSTGRES_USER`: The user of the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password of the PostgreSQL database.
- `POSTGRES_DB`: The database name of the PostgreSQL database.

[frontend/.env.local](../frontend/.env.local):

- `NEXT_PUBLIC_ALICE_HOST`: This is the address of the LND node for Alice. If you are running the application with Docker Compose, this should be something like `polar-n1-alice:10009`, since Docker networking will resolve it to the container IP address, but if you are running the application locally, you should use something like `127.0.0.1:10001`.
- `NEXT_PUBLIC_ALICE_CERT`: The TLS certificate of the alice LND node.
- `NEXT_PUBLIC_ALICE_MACAROON`: The macaroon of the alice LND node.
- `NEXT_PUBLIC_BOB_HOST`: This is the address of the LND node for Bob. If you are running the application with Docker Compose, this should be something like `polar-n1-bob:10009`, since Docker networking will resolve it to the container IP address, but if you are running the application locally, you should use something like `127.0.0.1:10002`.
- `NEXT_PUBLIC_BOB_CERT`: The TLS certificate of the bob LND node.
- `NEXT_PUBLIC_BOB_MACAROON`: The macaroon of the bob LND node.
