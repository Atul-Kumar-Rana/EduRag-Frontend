# 🍽 Smart Recipe Web Application

A full-stack Smart Recipe web application built with **React**, **Spring Boot**, and **MySQL**.

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Axios, Bootstrap 5 |
| Backend    | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database   | MySQL 8                             |
| Auth       | JWT (JSON Web Tokens)               |
| API Docs   | Swagger / OpenAPI 3                 |
| Build Tool | Maven                               |

---

## 📁 Project Structure

```
smart-recipe/
├── backend/                        # Spring Boot Application
│   ├── src/main/java/com/smartrecipe/
│   │   ├── SmartRecipeApplication.java
│   │   ├── config/                 # Security & OpenAPI config
│   │   ├── controller/             # REST Controllers
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # JPA Entities
│   │   ├── exception/              # Global exception handling
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   ├── security/               # JWT Auth, Filters
│   │   └── service/                # Business Logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                       # React Application
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/                # Auth Context (global state)
        ├── services/               # Axios API service layer
        ├── components/             # Reusable UI components
        └── pages/                  # Route-level page components
```

---

## ⚙️ Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8
- Maven 3.8+

---

## 🗄️ Database Setup

Open MySQL and run:

```sql
CREATE DATABASE smart_recipe_db;
```

> Hibernate will auto-create all tables on first run (`spring.jpa.hibernate.ddl-auto=update`).

---

## 🚀 Running the Backend

1. Open `backend/src/main/resources/application.properties`
2. Update DB credentials if needed:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

3. From the `backend/` directory, run:

```bash
mvn spring-boot:run
```

Backend starts at → **http://localhost:8080**  
Swagger UI → **http://localhost:8080/swagger-ui.html**

---

## 🌐 Running the Frontend

From the `frontend/` directory:

```bash
npm install
npm start
```

Frontend starts at → **http://localhost:3000**

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint             | Description     | Auth Required |
|--------|----------------------|-----------------|---------------|
| POST   | /api/auth/register   | Register user   | No            |
| POST   | /api/auth/login      | Login user      | No            |

### Recipes
| Method | Endpoint                  | Description            | Auth Required |
|--------|---------------------------|------------------------|---------------|
| GET    | /api/recipes              | Get all recipes        | No            |
| GET    | /api/recipes/{id}         | Get recipe by ID       | No            |
| GET    | /api/recipes/search       | Search & filter        | No            |
| POST   | /api/recipes              | Create recipe          | Yes           |
| PUT    | /api/recipes/{id}         | Update recipe          | Yes           |
| DELETE | /api/recipes/{id}         | Delete recipe          | Yes           |
| GET    | /api/recipes/my-recipes   | Get logged-in user's recipes | Yes     |
| POST   | /api/recipes/{id}/save    | Save / unsave recipe   | Yes           |
| GET    | /api/recipes/saved        | Get saved recipes      | Yes           |

### Reviews
| Method | Endpoint                              | Description       | Auth Required |
|--------|---------------------------------------|-------------------|---------------|
| GET    | /api/recipes/{recipeId}/reviews       | Get reviews       | No            |
| POST   | /api/recipes/{recipeId}/reviews       | Add review        | Yes           |
| DELETE | /api/recipes/{recipeId}/reviews/{id}  | Delete review     | Yes           |

---

## ✨ Features

- ✅ User Registration & Login with JWT Authentication
- ✅ Browse all recipes with search and filters (diet, cuisine, difficulty)
- ✅ Create, Edit, Delete your own recipes
- ✅ Add ingredients with quantity and unit
- ✅ Step-by-step cooking instructions
- ✅ Save / Unsave recipes (favourites)
- ✅ Star rating & review system (one review per user per recipe)
- ✅ Recipe detail page with full info
- ✅ Responsive UI with Bootstrap 5
- ✅ Swagger API documentation
- ✅ Global exception handling
- ✅ Form validation (frontend + backend)

---

## 👤 Author

**Name:** [Your Name]  
**Roll Number:** [Your Roll Number]  
**Batch/Program:** FSD Java  
**Submission Date:** April 21, 2026
