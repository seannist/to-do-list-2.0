# Cyberpunk Todo App

A modern, cyberpunk-themed todo application built with Next.js, TypeScript, and Supabase. Features a sleek dark interface with neon accents and dynamic effects.

## Features

- 🔐 User Authentication with Supabase
- 🎨 Cyberpunk-themed UI with dynamic effects
- 📝 Create, read, update, and delete todos
- 🎯 Priority levels for tasks
- 📅 Due date setting with overdue indicators
- 📊 Mission completion ratio tracking
- 🖼️ Image upload and analysis for task creation
- 🌙 Dark mode by default
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS
- Lucide Icons
- React Hot Toast

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── todo-app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── auth/
├── lib/
│   └── supabase/
└── public/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 