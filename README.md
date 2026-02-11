<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AtellasFleet - Premium Car Rental & Fleet Management

A modern, AI-powered car rental and fleet management platform built with React, TypeScript, and Three.js.

View your app in AI Studio: https://ai.studio/apps/drive/19HmrXuz2rZBGYuFHtp8_RT6neQMqoqKR

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📦 Deployment

This project is ready to deploy on multiple platforms:

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abdelilahIbba/ATELLASFLLET)

1. Click the "Deploy" button above or visit [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add your `GEMINI_API_KEY` environment variable in project settings
4. Deploy!

The `vercel.json` configuration file is already set up for optimal deployment.

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abdelilahIbba/ATELLASFLLET)

1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. Configure your site name
4. Add your `GEMINI_API_KEY` environment variable
5. Deploy!

The `netlify.toml` configuration file handles the build and routing automatically.

### Deploy to GitHub Pages

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings > Pages
   - Source: GitHub Actions

2. **Add your API key as a secret:**
   - Go to Settings > Secrets and variables > Actions
   - Add a new secret named `GEMINI_API_KEY`

3. **Deploy:**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Your site will be available at: `https://[username].github.io/ATELLASFLLET`

The deployment workflow is configured in `.github/workflows/deploy.yml`.

### Manual Deployment

For other hosting providers:

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to your hosting provider

3. Configure your server to:
   - Serve `index.html` for all routes (SPA routing)
   - Set the `GEMINI_API_KEY` environment variable

## 🔧 Technology Stack

- **Frontend:** React 19, TypeScript
- **3D Graphics:** Three.js, React Three Fiber
- **Animation:** Framer Motion
- **Build Tool:** Vite
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React

## 📝 Environment Variables

Create a `.env.local` file based on `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key for AI features | Yes |

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 🛠️ CI/CD

This project includes automated CI/CD workflows:

- **CI Workflow** (`.github/workflows/ci.yml`): Runs on every push and PR to test builds
- **Deploy Workflow** (`.github/workflows/deploy.yml`): Automatically deploys to GitHub Pages on main branch updates

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For any questions or issues, please contact the repository owner.
