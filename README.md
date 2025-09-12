# Welcome to your Lovable project

## EssayAI - AI-Powered College Essay Assistant

A comprehensive platform that helps students create compelling college application essays using AI while preserving their authentic voice and personal story.

### 🚀 Features

- **AI Essay Generation**: Powered by OpenAI GPT-4o with advanced human-like writing
- **AI Detection Bypass**: Essays designed to pass Turnitin, ZeroGPT, and Grammarly AI Checker
- **Voice Input**: Speech-to-text functionality for natural story sharing
- **Complete Authentication Flow**: Secure signup/signin with plan selection
- **Subscription Management**: Free, Monthly, and Yearly plans with usage tracking
- **Essay Management**: Save, edit, and organize multiple essays
- **Human Review System**: Professional essay reviews by admissions counselors
- **Multiple School Support**: Pre-loaded prompts for top universities
- **Essay Analysis**: Word count, tone analysis, and authenticity metrics
- **Export Options**: Download essays in multiple formats
- **Protected Routes**: Authentication required for all core features

### 🛠️ Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key
   - Add your Supabase project URL and anon key

3. **Database Setup** (Supabase)
   - Create a new Supabase project
   - Run the SQL migrations in `/supabase/migrations/`
   - Enable Row Level Security (RLS)

4. **Start Development**
   ```bash
   npm run dev
   ```

### 🔧 API Keys Required

- **OpenAI API Key**: For advanced AI essay generation with human-like output
- **Supabase Project**: For user authentication and data storage

### 📱 Key Pages

- `/` - Landing page with features and pricing
- `/pricing` - Comprehensive pricing plans and features
- `/auth` - Authentication with plan selection
- `/essay-builder` - Multi-step essay creation wizard
- `/essay-result` - Essay display, editing, and sharing
- `/dashboard` - User dashboard with saved essays
- `/human-review` - Submit essays for professional review

## Project info

**URL**: https://lovable.dev/projects/ebf0079e-e688-4e7a-b387-8e57878c56ed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ebf0079e-e688-4e7a-b387-8e57878c56ed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ebf0079e-e688-4e7a-b387-8e57878c56ed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🔧 Next Steps for Full Implementation:**
1. **Payment Integration**: Connect Stripe for subscription processing
2. **Human Review Workflow**: Implement reviewer assignment and feedback system
3. **Advanced Analytics**: Usage tracking and plan limit enforcement
4. **Email Notifications**: Review status updates and plan reminders
5. **Mobile App**: React Native version for mobile access