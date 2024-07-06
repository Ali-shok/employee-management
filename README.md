Certainly! Here's a `README.md` file for your project. This will help others understand how to set up and run your microservices project.

```markdown
# Node.js Microservices with MySQL

This project demonstrates a simple microservices architecture using Node.js and MySQL. The project consists of two microservices: Product Service and Order Service. Each service connects to a shared MySQL database.

## Project Structure

```
project-root/
│
├── product-service/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── order-service/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── shared/
│   └── db.js
│
└── database.sql
```

## Prerequisites

- Node.js (v14 or later)
- MySQL server

## Setting Up the Database

1. Ensure your MySQL server is running.
2. Execute the `database.sql` file to set up the `ecommerce` database and the necessary tables.

```bash
mysql -u root -p < database.sql
```

## Setting Up the Services

### Common Setup

1. Create a shared `db.js` file for the database connection:

```javascript
// shared/db.js
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = connection;
```

### Product Service

1. Navigate to the `product-service` directory.

```bash
cd product-service
```

2. Create a `.env` file with the following content:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
```

3. Install the dependencies:

```bash
npm install
```

4. Start the Product Service:

```bash
npm start
```

### Order Service

1. Navigate to the `order-service` directory.

```bash
cd ../order-service
```

2. Create a `.env` file with the following content:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
```

3. Install the dependencies:

```bash
npm install
```

4. Start the Order Service:

```bash
npm start
```

## Usage

### Product Service

- **Get all products**: `GET /products`
- **Create a new product**: `POST /products`

Example using `curl`:

```bash
curl -X GET http://localhost:3001/products
curl -X POST -H "Content-Type: application/json" -d '{"name":"Product1", "price":100}' http://localhost:3001/products
```

### Order Service

- **Get all orders**: `GET /orders`
- **Create a new order**: `POST /orders`

Example using `curl`:

```bash
curl -X GET http://localhost:3002/orders
curl -X POST -H "Content-Type: application/json" -d '{"product_id":1, "quantity":2}' http://localhost:3002/orders
```

## Troubleshooting

If you encounter issues with the MySQL connection, ensure that:

1. MySQL is running and accessible at `127.0.0.1` on port `3306`.
2. The `root` user has the necessary permissions and the correct password is set in the `.env` files.
3. There are no firewall rules blocking the connection.

## License

This project is licensed under the MIT License.
```
