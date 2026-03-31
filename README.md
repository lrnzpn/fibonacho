# 🌮 Fibonacho

**Nacho average pointing poker!** A high-vibe, real-time planning poker tool for agile teams.

## ✨ Features

- **Real-time Collaboration**: Vote simultaneously with your team using Firebase
- **Fibonacci & Special Cards**: Standard Fibonacci sequence (0, 1, 2, 3, 5, 8, 13) plus special cards (?, ☕)
- **Role Management**: Moderators, voters, and spectators with different permissions
- **Session History**: Track and export estimation history
- **Reactions**: Send live reactions (🎉, 👍, 🤔, 🔥, ☕) during sessions
- **Timer Support**: Optional countdown timers for time-boxed voting
- **Dark/Light Theme**: Beautiful themes with system preference detection
- **No Sign-up Required**: Anonymous authentication for instant access

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fibonacho.git
cd fibonacho
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

Add your Firebase configuration to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🎨 Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# Run all checks (CI)
npm run ci
```

## ♿ Accessibility

Fibonacho is built with accessibility in mind, following WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: ARIA labels, landmarks, and live regions
- **Skip Links**: Skip to main content for keyboard users
- **Theme Support**: High contrast dark and light themes
- **Error Handling**: User-friendly error pages with clear navigation

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed accessibility documentation.

## 🛡️ Error Handling

### Custom Error Pages

- **404 Not Found**: "This is nacho business!" - Friendly 404 page with navigation options
- **Runtime Errors**: "Something went nacho-riously wrong!" - Global error boundary with retry options
- **Invalid Rooms**: "That's nacho room!" - Room-specific error handling with automatic redirect

All error pages feature:

- Witty nacho-themed messaging
- Clear navigation options
- Visual Nacho icon for brand consistency
- Keyboard accessible buttons

## 📁 Project Structure

```
fibonacho/
├── app/                      # Next.js app directory
│   ├── room/[roomId]/       # Dynamic room pages
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── room/               # Room-specific components
│   └── icons/              # Icon components
├── contexts/               # React contexts
├── lib/                    # Utilities and Firebase
│   ├── firebase/          # Firebase configuration
│   └── utils/             # Helper functions
├── types/                  # TypeScript types
└── __tests__/             # Test files
```

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Anonymous Authentication
4. Set up Firestore security rules (see `firestore.rules`)
5. Deploy indexes (see `firestore.indexes.json`)

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/fibonacho)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Docker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Made with 🌮 and ❤️ by the Fibonacho team
