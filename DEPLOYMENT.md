# ATELLASFLEET Deployment Guide

This guide provides detailed instructions for deploying the ATELLASFLEET application to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Platform-Specific Deployments](#platform-specific-deployments)
4. [Docker Deployment](#docker-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Environment Variables

The application requires the following environment variable:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Platform-Specific Deployments

### 1. Vercel (Recommended for Quick Deployment)

**Method 1: One-Click Deploy**
1. Click the "Deploy with Vercel" button in README
2. Import the repository
3. Add environment variable: `GEMINI_API_KEY`
4. Click Deploy

**Method 2: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework: Vite

### 2. Netlify

**Method 1: One-Click Deploy**
1. Click "Deploy to Netlify" button in README
2. Connect GitHub account
3. Configure site settings
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy

**Method 2: Using Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

**Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

**Setup:**
1. Go to repository Settings > Pages
2. Source: Select "GitHub Actions"
3. Go to Settings > Secrets and variables > Actions
4. Add secret: `GEMINI_API_KEY` with your API key

**Deploy:**
- Push to `main` branch
- GitHub Actions automatically builds and deploys
- Site available at: `https://[username].github.io/ATELLASFLLET`

**Note:** The workflow is in `.github/workflows/deploy.yml`

### 4. AWS Amplify

1. Go to AWS Amplify Console
2. Click "New App" > "Host web app"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Base directory: `/`
   - Output directory: `dist`
5. Add environment variable: `GEMINI_API_KEY`
6. Save and deploy

### 5. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Configure:
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

## Docker Deployment

### Local Docker Build

```bash
# Build the Docker image
docker build -t atellasfleet .

# Run the container
docker run -p 3000:80 atellasfleet
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f
```

### Deploy to Docker Hub

```bash
# Build and tag
docker build -t yourusername/atellasfleet:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push yourusername/atellasfleet:latest
```

### Deploy to Cloud Platforms with Docker

**AWS ECS/Fargate:**
1. Push image to Amazon ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

**Google Cloud Run:**
```bash
# Build and deploy
gcloud run deploy atellasfleet \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Azure Container Instances:**
```bash
# Create resource group
az group create --name atellasfleet-rg --location eastus

# Deploy container
az container create \
  --resource-group atellasfleet-rg \
  --name atellasfleet \
  --image yourusername/atellasfleet:latest \
  --ports 80 \
  --dns-name-label atellasfleet
```

## Post-Deployment

### Verify Deployment

1. **Check the build:**
   - Navigate to your deployed URL
   - Ensure all pages load correctly
   - Test navigation between sections

2. **Test AI Features:**
   - Open the AI Assistant
   - Send a test message
   - Verify API integration works

3. **Check 3D Scene:**
   - Verify the hero 3D scene loads
   - Test camera rotation
   - Check performance on different devices

4. **Test Booking Flow:**
   - Try to make a test booking
   - Fill out forms
   - Verify form validation

### Performance Optimization

After deployment, consider:

1. **CDN Configuration:**
   - Enable CDN for static assets
   - Configure cache headers

2. **Monitoring:**
   - Set up error tracking (Sentry, LogRocket)
   - Configure analytics (Google Analytics)
   - Monitor performance (Lighthouse CI)

3. **SEO:**
   - Add meta tags
   - Configure sitemap.xml
   - Set up robots.txt

## Troubleshooting

### Build Fails

**Issue:** Build fails with missing dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue:** Environment variables not working
- Ensure `GEMINI_API_KEY` is set in your platform's environment settings
- For local builds, create `.env.local` file
- Restart the build process after adding variables

### Routing Issues

**Issue:** 404 errors on page refresh
- Ensure your hosting platform is configured for SPA routing
- Check that all routes redirect to `index.html`
- Verify `vercel.json` or `netlify.toml` configuration

### API Issues

**Issue:** Gemini API not working
- Verify your API key is valid
- Check API key permissions in Google AI Studio
- Ensure the environment variable is correctly set
- Check browser console for CORS errors

### 3D Scene Not Loading

**Issue:** Three.js scene doesn't render
- Check browser compatibility (WebGL support)
- Verify GPU acceleration is enabled
- Check console for WebGL-related errors
- Test on different browsers/devices

### Docker Issues

**Issue:** Container won't start
```bash
# Check logs
docker logs [container-id]

# Rebuild without cache
docker build --no-cache -t atellasfleet .
```

**Issue:** Port already in use
```bash
# Use a different port
docker run -p 8080:80 atellasfleet
```

## Support

For deployment issues:
1. Check the [GitHub Issues](https://github.com/abdelilahIbba/ATELLASFLLET/issues)
2. Review platform-specific documentation
3. Contact the repository owner

## Security Notes

- Never commit `.env.local` or API keys to version control
- Use platform-specific secret management for production
- Regularly rotate API keys
- Monitor API usage and set up billing alerts
- Enable HTTPS on all production deployments
- Configure CSP headers for additional security

## Continuous Deployment

The repository includes CI/CD workflows:

- **CI Workflow** (`.github/workflows/ci.yml`): Tests builds on all branches
- **Deploy Workflow** (`.github/workflows/deploy.yml`): Deploys to GitHub Pages on main branch

To set up CD for other platforms:
1. Add platform-specific deployment actions
2. Configure secrets in GitHub repository settings
3. Trigger deployments on main branch merges

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment Documentation](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
