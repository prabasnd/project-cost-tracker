# 🚀 Deployment Guide

Complete guide to deploying Project Cost Tracker to production.

---

## Deployment Options

### Option 1: GitHub Pages (Free & Easy)

**Best for:** Personal use, testing, small teams

#### Prerequisites
- GitHub account
- Git installed

#### Steps

1. **Create Repository**
   ```bash
   cd project-cost-tracker
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cost-tracker.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository settings
   - Navigate to "Pages"
   - Source: Deploy from `main` branch
   - Folder: `/` (root)
   - Click Save

4. **Access Your App**
   - URL: `https://YOUR_USERNAME.github.io/cost-tracker/`
   - Wait 2-3 minutes for deployment
   - App available with HTTPS ✓

#### Update Deployment
```bash
git add .
git commit -m "Update"
git push
```

---

### Option 2: Netlify (Recommended)

**Best for:** Production use, custom domains, teams

#### Prerequisites
- Netlify account (free)
- GitHub repository

#### Steps

1. **Push to GitHub** (same as Option 1)

2. **Connect Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

3. **Build Settings**
   - Build command: (leave empty)
   - Publish directory: `/`
   - Click "Deploy site"

4. **Custom Domain** (Optional)
   - Click "Domain settings"
   - Add custom domain
   - Follow DNS instructions

5. **HTTPS**
   - Automatically enabled ✓
   - Free SSL certificate

#### Features
- ✅ Instant deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Rollback support
- ✅ Preview deployments

---

### Option 3: Vercel

**Best for:** Advanced features, team collaboration

#### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd project-cost-tracker
   vercel
   ```

3. **Follow Prompts**
   - Login to Vercel
   - Confirm project settings
   - Wait for deployment

4. **Production URL**
   - Get: `https://your-project.vercel.app`
   - Custom domain available

#### Update
```bash
vercel --prod
```

---

### Option 4: Firebase Hosting

**Best for:** Google Cloud integration, global CDN

#### Prerequisites
- Firebase account
- Firebase CLI installed

#### Steps

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Initialize**
   ```bash
   cd project-cost-tracker
   firebase init hosting
   ```

4. **Configure**
   - Public directory: `.` (current)
   - Single-page app: Yes
   - GitHub actions: No

5. **Deploy**
   ```bash
   firebase deploy
   ```

6. **Access**
   - URL: `https://YOUR_PROJECT.firebaseapp.com`

---

### Option 5: Self-Hosted (VPS)

**Best for:** Full control, custom requirements

#### Prerequisites
- VPS (DigitalOcean, Linode, AWS, etc.)
- Domain name
- SSL certificate

#### Using Nginx

1. **Upload Files**
   ```bash
   scp -r project-cost-tracker/ user@your-server:/var/www/
   ```

2. **Nginx Config**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/project-cost-tracker;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable HTTPS** (Let's Encrypt)
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

4. **Restart Nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

## Pre-Deployment Checklist

### Required Updates

- [ ] Update Google Apps Script URL in `js/sync.js`
- [ ] Generate app icons (see Icon Generation below)
- [ ] Test on multiple devices
- [ ] Verify offline mode works
- [ ] Test sync functionality
- [ ] Check console for errors

### Performance Optimization

- [ ] Minify CSS/JS (optional)
- [ ] Compress images
- [ ] Enable gzip compression
- [ ] Set cache headers
- [ ] Test on slow connections

### Security

- [ ] HTTPS enabled (required for PWA)
- [ ] Content Security Policy (optional)
- [ ] Remove console.logs (optional)
- [ ] Validate Google Sheets access

---

## Icon Generation

### Using Online Tools

**Option A: Real Favicon Generator**
1. Go to [realfavicongenerator.net](https://realfavicongenerator.net)
2. Upload a 512x512 source image
3. Configure settings
4. Download package
5. Extract to `/icons/` folder

**Option B: PWA Asset Generator**
```bash
npx pwa-asset-generator logo.png icons/ \
  --background "#6366f1" \
  --scrape false \
  --icon-only
```

### Manual Creation

Use any image editor to create:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Save as PNG in `/icons/` folder.

### Placeholder Icons

For quick testing, use solid color squares with text.

---

## Environment Variables

### Development
```javascript
// js/config.js
const CONFIG = {
  SCRIPT_URL: 'http://localhost:8000/mock-api',
  DEBUG: true,
  SYNC_INTERVAL: 5000 // 5 seconds
};
```

### Production
```javascript
// js/config.js
const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/XXX/exec',
  DEBUG: false,
  SYNC_INTERVAL: 30000 // 30 seconds
};
```

---

## Testing Deployment

### Pre-Launch Tests

1. **Lighthouse Audit**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit
   - Target: 90+ PWA score

2. **PWA Checklist**
   - [ ] Installable
   - [ ] Works offline
   - [ ] HTTPS enabled
   - [ ] Service Worker registered
   - [ ] Manifest valid
   - [ ] Icons present

3. **Cross-Browser**
   - [ ] Safari (iPad)
   - [ ] Chrome (Desktop)
   - [ ] Firefox
   - [ ] Edge

4. **Device Testing**
   - [ ] iPad Pro 12.9"
   - [ ] iPad Air
   - [ ] iPad Mini
   - [ ] iPhone (responsive)

### Load Testing

Test with sample data:
```javascript
// Generate 100 test entries
for (let i = 0; i < 100; i++) {
  await db.addEntry({
    project: `Project ${i}`,
    costType: ['Labour', 'Material'][i % 2],
    amount: Math.random() * 10000,
    paymentMode: 'Cash',
    status: 'Paid',
    date: new Date().toISOString().split('T')[0]
  });
}
```

---

## Monitoring & Analytics

### Service Worker Status

Check in DevTools:
```javascript
navigator.serviceWorker.getRegistrations().then(console.log)
```

### Cache Status
```javascript
caches.keys().then(console.log)
```

### Database Size
```javascript
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
});
```

### Error Tracking (Optional)

Add to `app.js`:
```javascript
window.addEventListener('error', (e) => {
  // Send to analytics service
  fetch('https://your-logging-service.com/log', {
    method: 'POST',
    body: JSON.stringify({
      error: e.error.message,
      stack: e.error.stack,
      timestamp: new Date().toISOString()
    })
  });
});
```

---

## Rollback Procedure

### GitHub Pages
```bash
git revert HEAD
git push
```

### Netlify
1. Go to Deploys tab
2. Find previous successful deploy
3. Click "Publish deploy"

### Vercel
```bash
vercel rollback
```

---

## Continuous Deployment

### GitHub Actions (Netlify)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Post-Deployment

### User Communication

1. **Notify Users**
   - Send email with app URL
   - Include installation guide
   - Share quick start video

2. **Documentation**
   - Share README
   - Link to guides
   - Provide support contact

3. **Training**
   - Demo session
   - Q&A
   - Troubleshooting tips

### Maintenance Schedule

**Daily:**
- Monitor error logs
- Check sync queue

**Weekly:**
- Review Google Sheets
- Check storage usage
- Update if needed

**Monthly:**
- Performance audit
- User feedback
- Feature updates

---

## Scaling Considerations

### High Volume (1000+ entries/day)

**Optimizations:**
1. Batch sync operations
2. Implement pagination
3. Add data archiving
4. Use Google Sheets API (not Apps Script)
5. Consider database backend

### Multiple Teams

**Setup:**
1. Separate Google Sheets per team
2. Different deployment URLs
3. Shared codebase
4. Team-specific configs

---

## Troubleshooting

### Service Worker Not Updating

**Solution:**
1. Increment version in `service-worker.js`
2. Clear browser cache
3. Hard refresh (Cmd+Shift+R)
4. Unregister old worker:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   ```

### HTTPS Certificate Issues

**Solution:**
1. Wait for SSL provisioning (can take 24 hours)
2. Check DNS configuration
3. Verify domain ownership
4. Contact hosting support

---

## Success Metrics

Track these metrics:

- [ ] Install rate
- [ ] Active users (weekly)
- [ ] Entries per user
- [ ] Sync success rate
- [ ] Offline usage percentage
- [ ] Average sync time
- [ ] Error rate

---

## Support Plan

### Documentation
- README
- Setup guides
- Video tutorials
- FAQ

### Communication
- Email support
- Slack channel
- Monthly updates
- Feature requests

---

**Deployment Complete! 🎉**

Your app is now live and ready for use!
