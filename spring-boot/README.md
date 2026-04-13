# RuralConnect - Spring Boot Backend

Full Spring Boot 3 REST API backend for the RuralConnect digital marketplace.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2**
- **Spring Security 6** (JWT authentication, @PreAuthorize)
- **Spring Data JPA** (Hibernate ORM)
- **MySQL 8**
- **Lombok**
- **JJWT 0.11.5**

## Project Structure

```
src/main/java/com/ruralconnect/
├── RuralConnectApplication.java      # Entry point
├── config/
│   ├── SecurityConfig.java           # CORS, JWT filter chain
│   └── UserDetailsServiceImpl.java   # Load user from DB
├── security/
│   ├── JwtUtil.java                  # Token generation & validation
│   └── JwtFilter.java                # OncePerRequestFilter
├── entity/                           # JPA entities
│   ├── User.java
│   ├── Category.java
│   ├── Product.java
│   ├── Enquiry.java
│   └── Review.java
├── enums/
│   ├── Role.java                     # BUYER, SELLER, ADMIN
│   ├── ProductStatus.java            # PENDING, APPROVED, REJECTED
│   └── EnquiryStatus.java            # PENDING, ACCEPTED, REJECTED, COMPLETED
├── repository/                       # Spring Data JPA repos
│   ├── UserRepository.java
│   ├── CategoryRepository.java
│   ├── ProductRepository.java
│   ├── EnquiryRepository.java
│   └── ReviewRepository.java
├── dto/                              # Request/response DTOs
│   ├── AuthRequest.java
│   ├── RegisterRequest.java
│   ├── AuthResponse.java
│   ├── ProductDTO.java
│   ├── EnquiryDTO.java
│   └── ReviewDTO.java
├── service/                          # Business logic
│   ├── AuthService.java
│   ├── ProductService.java
│   ├── EnquiryService.java
│   ├── ReviewService.java
│   └── AdminService.java
└── controller/                       # REST controllers
    ├── AuthController.java
    ├── CategoryController.java
    ├── ProductController.java
    ├── EnquiryController.java
    ├── ReviewController.java
    └── AdminController.java
```

## Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.0+

## Setup Instructions

### 1. Create MySQL Database

```bash
mysql -u root -p
```

```sql
source schema.sql
```

Or run the SQL file manually in MySQL Workbench.

### 2. Configure application.properties

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ruralconnect?...
spring.datasource.username=your_username
spring.datasource.password=your_password
app.jwt.secret=your_minimum_32_character_secret_key
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

Server starts at `http://localhost:8080`

### 4. Default Admin Account

After running `schema.sql`, a default admin is created:
- Email: `admin@ruralconnect.com`
- Password: `admin123`

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register BUYER or SELLER |
| POST | `/login` | Public | Login, returns JWT |

### Products (`/api/products`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List approved products (paginated, filterable) |
| GET | `/:id` | Public | Get product details |
| GET | `/my` | SELLER | Get own products |
| POST | `/` | SELLER | Create product (PENDING by default) |
| PUT | `/:id` | SELLER | Update own product |
| DELETE | `/:id` | SELLER | Delete own product |

### Enquiries (`/api/enquiries`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | BUYER | Submit enquiry |
| GET | `/buyer` | BUYER | Get buyer's enquiries |
| GET | `/seller` | SELLER | Get seller's enquiries |
| PATCH | `/:id/status` | SELLER/BUYER | Update status (ACCEPTED/REJECTED/COMPLETED) |

### Reviews (`/api/reviews`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | BUYER | Submit review (after COMPLETED enquiry only) |
| GET | `/product/:id` | Public | Get product reviews |

### Admin (`/api/admin`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/users` | ADMIN | List all users |
| PATCH | `/users/:id/suspend` | ADMIN | Suspend/reinstate user |
| GET | `/products` | ADMIN | List all products |
| GET | `/products/pending` | ADMIN | List pending products |
| PATCH | `/products/:id/status` | ADMIN | Approve/reject product |

### Categories (`/api/categories`)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List all categories |

## Security Architecture

1. **JwtFilter** extends `OncePerRequestFilter` — intercepts every request, validates JWT from `Authorization: Bearer <token>` header, sets Spring Security context
2. **SecurityConfig** — defines public vs protected routes, enables `@PreAuthorize` via `@EnableMethodSecurity`
3. **BCrypt** password hashing (strength 12)
4. **Role-based access control** via `@PreAuthorize("hasRole('SELLER')")` annotations

## Status Flows

**Product**: `PENDING` → `APPROVED` / `REJECTED` (by ADMIN)

**Enquiry**: `PENDING` → `ACCEPTED` / `REJECTED` (by SELLER) → `COMPLETED` (by SELLER)

**Review**: Only allowed after enquiry reaches `COMPLETED` status
