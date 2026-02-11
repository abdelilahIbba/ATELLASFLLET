# ATELLASFLEET - Quick Deployment Reference

## 🚀 Quick Start

### Local Development
```bash
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

### Build for Production
```bash
npm run build     # Output: dist/
npm run preview   # Test production build locally
```

## ☁️ One-Click Deployments

| Platform | Button | Documentation |
|----------|--------|---------------|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abdelilahIbba/ATELLASFLLET) | [Vercel Docs](https://vercel.com/docs) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abdelilahIbba/ATELLASFLLET) | [Netlify Docs](https://docs.netlify.com/) |

### Required Environment Variable
- `GEMINI_API_KEY` - Your Google Gemini API key

## 🐳 Docker Deployment

### Quick Start
```bash
docker build -t atellasfleet .
docker run -p 3000:80 atellasfleet
```

### Using Docker Compose
```bash
docker compose up -d
# Access at http://localhost:3000
docker compose down
```

## 📦 GitHub Pages

1. Enable GitHub Pages in Settings > Pages > Source: GitHub Actions
2. Add `GEMINI_API_KEY` secret in Settings > Secrets > Actions
3. Push to `main` branch - automatic deployment via GitHub Actions

**URL:** `https://[username].github.io/ATELLASFLLET`

## 📋 Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment config |
| `netlify.toml` | Netlify deployment config |
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | Docker Compose setup |
| `nginx.conf` | Nginx server config for Docker |
| `.github/workflows/ci.yml` | Continuous integration |
| `.github/workflows/deploy.yml` | GitHub Pages deployment |
| `.env.example` | Environment variable template |

## ⚡ Platform-Specific Notes

### Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Auto-detects configuration from `vercel.json`

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects configured in `netlify.toml`
- Node version: 18

### GitHub Pages
- Triggered on push to `main` branch
- Requires Pages enabled in repository settings
- Uses GitHub Actions for build and deploy
- Requires `GEMINI_API_KEY` secret

### Docker
- Multi-stage build (builder + nginx)
- Production image: ~50MB (compressed)
- Port: 80 (map to your preferred port)
- Includes security headers and caching

## 🔧 Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Environment variable not working
- Ensure variable name is exactly `GEMINI_API_KEY`
- For local: Create `.env.local` file
- For deployment: Add in platform settings
- Restart/redeploy after adding

### 404 on page refresh
- Check SPA routing is configured
- Vercel: `vercel.json` has rewrite rules
- Netlify: `netlify.toml` has redirects
- Docker: `nginx.conf` has `try_files` directive

### Docker container won't start
```bash
docker logs [container-id]
docker build --no-cache -t atellasfleet .
```

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md) - Comprehensive deployment documentation
- [README](./README.md) - Project overview and setup
- [Vite Docs](https://vitejs.dev/guide/static-deploy.html) - Static deployment guide

## 🎯 Next Steps

After deploying:
1. ✅ Test the deployed URL
2. ✅ Verify AI features work (requires valid API key)
3. ✅ Check 3D scene renders properly
4. ✅ Test booking flow
5. ✅ Monitor for errors (set up error tracking)

## 📞 Support

For deployment issues:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
- Review platform-specific documentation
- Check [GitHub Issues](https://github.com/abdelilahIbba/ATELLASFLLET/issues)
