# 👨‍💼 Employee-Management-System

**Enterprise HRM System with Role & Permission Management**  
_Payroll • Attendance • Scheduling • Access Control_

![Architecture](https://img.shields.io/badge/Architecture-Monorepo-orange)
![Frontend](https://img.shields.io/badge/Frontend-Angular%2020-red)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green)
![Database](https://img.shields.io/badge/Database-MySQL-blue)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

---

## 🚀 Overview

**Employee Management System** is a **full-featured, enterprise-ready HRM application** built using **Angular 20, Node.js, Express, and MySQL**.

This system provides **complete control over employees, payroll, attendance, scheduling**, and **advanced role & permission management** with a scalable and secure architecture.

Designed to handle **daily, weekly, and monthly workflows** efficiently for organizations of any size.

---

## 🏗️ Architecture

- **Monorepo Architecture**
- Modular & scalable design
- Frontend & backend separation
- Secure API communication

---

## 🧩 Core Modules

- Employee Management
- Payroll Management
- Attendance Tracking
- Shift & Schedule Management
- Role & Permission Management
- Multi-Application Support

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Secure login & token validation
- Middleware-based authorization
- Route-level & API-level guards

---

## 👤 Role & Permission System

### 🔑 Super Admin
- Create & manage roles
- Assign permissions dynamically
- Manage multiple applications/modules
- Control:
  - Menus
  - Sub-menus
  - Child menus
- Enable / Disable **CRUD permissions**

### 👥 Dynamic Roles
- Roles are created by Super Admin
- Permissions applied at:
  - Application level
  - Menu level
  - Sub-menu level
  - Child menu level
  - CRUD level (Create, Read, Update, Delete)
- UI & APIs automatically adapt based on permissions

---

## 🧠 Permission Levels

✔ Application Access  
✔ Menu Visibility  
✔ Sub Menu Access  
✔ Child Menu Control  
✔ CRUD Operations  

> Unauthorized users **cannot see or access restricted UI & APIs**

---

## 🗂️ Database Design

- MySQL relational database
- Fully normalized schema
- Foreign key constraints
- Optimized queries
- Mapping tables for:
  - Users ↔ Roles
  - Roles ↔ Permissions
  - Menus ↔ Applications

---

## ✅ Validations

### Backend
- Request validation
- Role & permission checks
- Token verification
- Secure error handling

### Frontend
- Angular Reactive Form validation
- Route guards
- Permission-based UI rendering

---

## ⚙️ Tech Stack

### Frontend
- Angular 20
- TypeScript
- RxJS
- Guards & Interceptors

### Backend
- Node.js
- Express.js
- JWT
- REST APIs

### Database
- MySQL

---

## 🛠️ Installation & Setup

### Backend
npm install

nodemon (npm run start)

---

### Frontend
npm install

ng serve

---
### Database

Import MySQL schema

Configure DB credentials in backend .env file

---
### 🔒 Security

JWT Authentication

Role-based API protection

Permission middleware

Secure password handling

---
### 📈 Future Enhancements

Audit logs

Activity monitoring

Reports & analytics

Multi-tenant support

Performance optimization

---
### 📝 Conclusion

This Employee Management System is an enterprise-grade HRM solution offering powerful role & permission management, secure architecture, and scalable design ideal for organizations requiring strict access control and workflow management.

