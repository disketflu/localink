# LocaLink - Local Tour Guide Platform

A full-featured SaaS platform connecting local guides with tourists, built with modern web technologies and best practices. This project was developed in less than a day using AI assistance, demonstrating the power of modern development tools and frameworks.

## 🌟 Features

### Core Functionality
- **User Roles**: Support for Tourists and Local Guides
- **Tour Management**: Create, browse, and manage tours
- **Booking System**: Secure booking process with status management
- **Real-time Messaging**: Built-in chat system for guide-tourist communication
- **Review System**: Comprehensive rating and review functionality
- **Profile Management**: Detailed user profiles with customizable information

### Technical Features
- **Internationalization**: Full support for multiple languages (English and French)
- **Authentication**: Secure user authentication with NextAuth.js
- **Real-time Updates**: Live chat and booking status updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **API Security**: Rate limiting and input validation
- **Database**: PostgreSQL with Prisma ORM
- **Modern Stack**: Next.js 14 with App Router

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks
- **Internationalization**: next-intl for multi-language support
- **UI Components**: Custom components with modern design
- **Form Handling**: Native form handling with validation

### Backend
- **API Routes**: Next.js API routes with proper error handling
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Security**: 
  - Rate limiting on sensitive endpoints
  - Input validation with Zod
  - XSS protection
  - CSRF protection
  - Secure password hashing

### Database Schema
- **Users**: Core user information and authentication
- **Profiles**: Extended user information
- **Tours**: Tour listings and details
- **Bookings**: Tour reservations and status
- **Reviews**: User feedback and ratings
- **Messages**: Real-time chat functionality
- **Chats**: Chat room management

## 🔒 Security Features
- Secure password hashing with bcrypt
- JWT-based authentication
- Rate limiting on sensitive endpoints
- Input sanitization
- Role-based access control
- Protected API routes
- Secure session management

## 🌐 Internationalization
- Full support for English and French
- Language switching with persistence
- RTL support ready
- Translated UI components
- Dynamic content translation

## 🚀 Performance Optimizations
- Server-side rendering where appropriate
- Client-side navigation
- Optimized image loading
- Efficient database queries
- Caching strategies
- Rate limiting to prevent abuse

## 🛠️ Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

## 🎯 Future Enhancements
- Payment integration (Stripe)
- Email notifications
- Push notifications
- Advanced search and filtering
- Guide verification system
- Analytics dashboard
- Mobile app development

## 🤖 AI-Powered Development
This project was developed in less than a day using AI assistance, demonstrating the power of modern development tools and frameworks. The AI helped with:
- Code generation and structure
- Best practices implementation
- Security considerations
- Database schema design
- API route implementation
- Frontend component development
- Testing strategies

## 📄 License
MIT License - feel free to use this project as you wish.
