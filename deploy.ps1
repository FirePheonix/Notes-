# Notesलो Vercel Deployment Script for Windows
Write-Host "🚀 Starting Notesलो deployment to Vercel..." -ForegroundColor Green

# Check if vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Blue

# Deploy Backend
Write-Host "🔧 Deploying backend..." -ForegroundColor Yellow
Set-Location Server
Write-Host "📁 In Server directory: $(Get-Location)" -ForegroundColor Blue
vercel --prod

Write-Host "✅ Backend deployed! Please note the URL for frontend configuration." -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Set these environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   - NODE_ENV=production" -ForegroundColor Cyan
Write-Host "   - MONGODB_URI=your_mongodb_connection_string" -ForegroundColor Cyan
Write-Host "   - CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key" -ForegroundColor Cyan
Write-Host "   - CLERK_SECRET_KEY=your_clerk_secret_key" -ForegroundColor Cyan
Write-Host "   - FRONTEND_URL=https://your-frontend.vercel.app" -ForegroundColor Cyan

# Wait for user confirmation
$backendUrl = Read-Host "📝 Enter your backend URL (e.g., https://notes-k2uf.vercel.app)"
if (-not $backendUrl) {
    Write-Host "❌ Backend URL is required. Please run the script again." -ForegroundColor Red
    exit 1
}

# Update Client .env
Write-Host "📝 Updating Client/.env with backend URL..." -ForegroundColor Yellow
Set-Location ../Client
$envContent = @"
VITE_API_URL=$backendUrl
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
"@
$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "✅ Updated Client/.env" -ForegroundColor Green

# Deploy Frontend
Write-Host "🎨 Deploying frontend..." -ForegroundColor Yellow
Write-Host "📁 In Client directory: $(Get-Location)" -ForegroundColor Blue
vercel --prod

Write-Host "✅ Frontend deployed!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Set these environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   - VITE_API_URL=$backendUrl" -ForegroundColor Cyan
Write-Host "   - VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "📋 CRITICAL: Update backend CORS with your frontend URL!" -ForegroundColor Red
Write-Host "   1. Go to your backend Vercel project settings" -ForegroundColor Cyan
Write-Host "   2. Add environment variable: FRONTEND_URL=https://your-frontend.vercel.app" -ForegroundColor Cyan
Write-Host "   3. Redeploy backend to apply CORS changes" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access your app at the FRONTEND URL (not backend URL)!" -ForegroundColor Green
Write-Host "📖 For troubleshooting, see DEPLOYMENT_FIX_GUIDE.md" -ForegroundColor Blue
