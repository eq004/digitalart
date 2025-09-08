# Netlify Deploy (Vite outDir = build)

Your Vite config sets:
```
build: { outDir: 'build' }
```
So Netlify must publish the **build/** folder.

**Build command:** `npm install && npm run build`  
**Publish directory:** `build`  
**Node:** 20

Steps:
1. Upload the contents of this folder to a GitHub repo.
2. In Netlify → New site from Git → pick the repo → Deploy.

Generated: 2025-09-08T02:01:49.239078
