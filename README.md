# 🛍️ E-Commerce Backend API

A full-featured e-commerce REST API built with NestJS, TypeORM, PostgreSQL, and JWT authentication.
Designed for scalability, security, and real-world production readiness.

# 🚀 Features
✅ Authentication & Authorization

Email/password signup and login

JWT-based authentication

Role-based access control (User/Admin)

✅ Product Management

Browse products with pagination

Filter by category, price range, and search

Admin-only product CRUD operations

Inventory tracking

✅ Shopping Cart

Add or remove items

Update item quantities

Real-time stock validation

User-specific carts

✅ Order Management

Create orders directly from cart

Automatic inventory deduction

Order status tracking

Order cancellation with stock restoration

Prevent out-of-stock purchases

✅ Admin Panel

Manage products

View all orders

Update order statuses

✅ Additional Features

Server-side validation

Comprehensive error handling

Transaction support for order creation

# 🧰 Tech Stack
Category	Technology
Framework	NestJS 10
Database	PostgreSQL with TypeORM
Authentication	JWT 
Validation	class-validator & class-transformer

# ⚙️ Installation
Prerequisites

Node.js v18+

PostgreSQL v14+

npm or yarn

1️⃣ Clone the Repository
git clone <repository-url>
cd ecommerce-api

2️⃣ Install Dependencies
npm install

3️⃣ Setup Database
Create a PostgreSQL database
createdb ecommerce

Or using psql
psql -U postgres
CREATE DATABASE ecommerce;

4️⃣ Configure Environment
cp .env.example .env
Edit .env with your database credentials and JWT secret

5️⃣ Run the Application
Development mode
npm run start:dev
