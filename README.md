# Localink - Local Tour Guide Platform

Localink is a modern web application that connects local tour guides with tourists, enabling authentic and personalized travel experiences. Built with Next.js, TypeScript, and Prisma, it offers a seamless platform for tour booking, management, and review.

## Features

- 🔐 Secure authentication system with NextAuth.js
- 👥 User roles: Tourists, Guides, and Admins
- 🗺️ Tour creation and management
- 📅 Booking system with status tracking
- ⭐ Review and rating system
- 👤 User profiles with expertise and language preferences
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Heroicons
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/localink.git
cd localink
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/localink"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
localink/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── tours/             # Tour-related pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
└── package.json              # Project dependencies
```

## Database Schema

The application uses the following main models:

- **User**: Stores user information and authentication details
- **Profile**: Contains additional user information like bio and expertise
- **Tour**: Represents tour offerings with details like price and duration
- **Booking**: Manages tour bookings and their status
- **Review**: Handles tour reviews and ratings

## Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint for code linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
