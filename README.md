# 🏨 Hotel Management System

A comprehensive hotel management system designed for small to medium-sized hotels. Built with Node.js, Express, PostgreSQL, and React.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, Guest)
- Secure password hashing with bcrypt
- User profile management

### 🏠 Room Management
- Room inventory tracking
- Room types and pricing management
- Availability calendar
- Room status tracking (available, occupied, maintenance, cleaning)

### 📅 Reservation System
- Online booking interface
- Reservation management
- Check-in/check-out processing
- Booking calendar and availability display
- Conflict detection for overlapping bookings

### 👥 Guest Management
- Guest profile management
- Guest history tracking
- Preferences and special requests
- Contact information management

### 💰 Billing & Payments
- Invoice generation
- Payment processing
- Payment status tracking
- Multiple payment methods support

### 🧹 Housekeeping Management
- Task assignment and tracking
- Status updates (pending, in-progress, completed)
- Room-specific task management
- Staff assignment

### 🌍 Multi-Language Support
- Spanish and English language support
- Dynamic language switching
- User language preferences
- Localized content

### 🗑️ Data Management
- Soft delete implementation across all entities
- Audit trails for data modifications
- Data export functionality to SQL Server
- Configurable export schedules

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **SQL Server** - Export destination
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend (Coming Soon)
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React-i18next** - Internationalization

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- SQL Server (for exports, optional)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env
   
   # Edit the environment variables
   nano server/.env
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb hotel_management
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# PostgreSQL Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hotel_management
DB_PASSWORD=your_password_here
DB_PORT=5432

# SQL Server (for exports)
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=your_sqlserver_password
SQLSERVER_HOST=localhost
SQLSERVER_DB=hotel_export
SQLSERVER_PORT=1433

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@hotelmanagement.com
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **rooms** - Room inventory and details
- **guests** - Guest profiles and preferences
- **reservations** - Booking information
- **billing** - Payment and invoice records
- **housekeeping** - Cleaning task management
- **audit_logs** - Data modification tracking
- **export_configs** - Export scheduling configuration

### Soft Delete Implementation
All tables include soft delete fields:
- `deleted_at` - Timestamp when record was deleted
- `deleted_by` - User ID who performed the deletion

### Audit Trail
All tables include audit fields:
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp
- `created_by` - User ID who created the record
- `updated_by` - User ID who last modified the record

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (staff only)
- `GET /api/users/:id` - Get user by ID (staff only)
- `PUT /api/users/:id` - Update user (staff only)
- `DELETE /api/users/:id` - Soft delete user (staff only)
- `POST /api/users/:id/restore` - Restore deleted user (staff only)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create new room (staff only)
- `PUT /api/rooms/:id` - Update room (staff only)
- `DELETE /api/rooms/:id` - Soft delete room (staff only)
- `GET /api/rooms/available` - Get available rooms for date range

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `POST /api/reservations/:id/cancel` - Cancel reservation
- `DELETE /api/reservations/:id` - Soft delete reservation (staff only)

### Guests
- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get guest by ID
- `POST /api/guests` - Create new guest
- `PUT /api/guests/:id` - Update guest
- `GET /api/guests/:id/history` - Get guest reservation history
- `DELETE /api/guests/:id` - Soft delete guest (staff only)

### Billing
- `GET /api/billing` - Get all billing records
- `GET /api/billing/:id` - Get billing record by ID
- `POST /api/billing` - Create new billing record
- `PUT /api/billing/:id` - Update billing record
- `POST /api/billing/:id/process-payment` - Process payment
- `DELETE /api/billing/:id` - Soft delete billing record (staff only)

### Housekeeping
- `GET /api/housekeeping` - Get all housekeeping tasks
- `GET /api/housekeeping/:id` - Get task by ID
- `POST /api/housekeeping` - Create new task
- `PUT /api/housekeeping/:id` - Update task
- `POST /api/housekeeping/:id/complete` - Complete task
- `GET /api/housekeeping/room/:roomId` - Get tasks by room
- `DELETE /api/housekeeping/:id` - Soft delete task (staff only)

## 👥 Default Users

After running the seed script, the following users are created:

- **Admin**: `admin@hotel.com` / `admin123`
- **Staff**: `staff@hotel.com` / `staff123`
- **Guest**: `guest@example.com` / `guest123`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start both server and client
npm run server:dev       # Start server only
npm run client:dev       # Start client only

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed initial data

# Build
npm run build            # Build client for production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run lint             # Run linting
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - API request throttling
- **Input validation** - Request data validation
- **SQL injection protection** - Parameterized queries
- **JWT token expiration** - Automatic token refresh
- **Password hashing** - bcrypt with salt rounds

## 🌍 Internationalization

The system supports multiple languages:
- **English (en)** - Default language
- **Spanish (es)** - Full translation support

Language preferences are stored per user and can be changed dynamically.

## 📊 Data Export

The system includes functionality to export data to SQL Server:
- Configurable export schedules
- Support for all major data tables
- Audit logging of export operations
- Error handling and retry mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

- [ ] Frontend React application
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Integration with external booking systems
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Advanced analytics dashboard 