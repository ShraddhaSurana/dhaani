# Dhaani Website

A modern, responsive website for Dhaani - the human-AI collaborative software development tool.

## Overview

This website showcases Dhaani's revolutionary 2-step approach to software development: design first, then code. It combines human creativity with AI efficiency to build modular software with human-in-the-loop control.

## Features

- **Modern Design**: Clean, Google/OpenAI-inspired aesthetic with teal-blue gradient theme
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations, hover effects, and user feedback
- **Analytics Tracking**: Comprehensive tracking for user engagement and business metrics
- **Contact Form**: Integrated contact form with email functionality
- **Video Integration**: Placeholder for YouTube demo video
- **Research Showcase**: Links to published papers and conference acceptances

## File Structure

```
dhaani/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript for interactions and analytics
├── logo.svg            # SVG logo with teal-blue gradient
└── README.md           # This file
```

## Setup Instructions

### 1. Basic Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. The website should load with all styles and functionality

### 2. Local Development Server (Recommended)

For best performance and to avoid CORS issues:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have it installed)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### 3. Customization

#### Logo
- Replace `logo.svg` with your actual logo file
- Ensure the logo is 40x40px for optimal display
- Update the `alt` text in HTML if needed

#### Colors
- Modify CSS variables in `styles.css` to change the color scheme:
  ```css
  :root {
      --primary-teal: #0891b2;
      --primary-blue: #0ea5e9;
      --gradient-primary: linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%);
  }
  ```

#### Content
- Update text content in `index.html`
- Modify section titles, descriptions, and CTAs
- Add your actual download links in the download section

### 4. Analytics Setup

#### Google Analytics
1. Get your Google Analytics Measurement ID
2. Replace `GA_MEASUREMENT_ID` in `index.html` with your actual ID
3. Analytics will automatically track:
   - Page views and user sessions
   - Download clicks and sources
   - Video interactions
   - Form submissions
   - Scroll depth and time on page

#### Custom Analytics
The website includes a comprehensive analytics system that tracks:
- User engagement metrics
- Download conversion rates
- Form interactions
- Navigation patterns
- External link clicks

Access analytics data via browser console: `window.analytics.getAnalyticsData()`

### 5. Contact Form Integration

The contact form currently simulates email sending. To integrate with a real email service:

1. **EmailJS** (Recommended for static sites):
   ```javascript
   // Add EmailJS script to HTML
   // Configure email service in script.js
   ```

2. **Netlify Forms** (if hosting on Netlify):
   ```html
   <!-- Add netlify attribute to form -->
   <form netlify name="contact" method="POST">
   ```

3. **Custom Backend**:
   - Create an API endpoint to handle form submissions
   - Update the `handleContactSubmit` function in `script.js`

### 6. Video Integration

To add your YouTube demo video:

1. Upload your video to YouTube
2. Get the video ID from the URL
3. Replace the video placeholder in `index.html`:
   ```html
   <div class="video-wrapper">
       <iframe 
           src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
           frameborder="0" 
           allowfullscreen>
       </iframe>
   </div>
   ```

### 7. Download Links

Update the download buttons to point to your actual files:

```javascript
// In script.js, update the trackDownload function
function trackDownload(source, platform = null) {
    analytics.trackDownload(source, platform);
    
    // Add your actual download URLs here
    const downloadUrls = {
        'mac': 'https://your-domain.com/downloads/dhaani-mac.dmg',
        'windows': 'https://your-domain.com/downloads/dhaani-windows.exe',
        'linux': 'https://your-domain.com/downloads/dhaani-linux.tar.gz'
    };
    
    if (platform && downloadUrls[platform]) {
        window.open(downloadUrls[platform], '_blank');
    }
}
```

## Deployment

### Static Hosting (Recommended)

1. **Netlify**:
   - Connect your GitHub repository
   - Deploy automatically on push
   - Includes form handling and analytics

2. **Vercel**:
   - Import your repository
   - Automatic deployments
   - Great for static sites

3. **GitHub Pages**:
   - Enable in repository settings
   - Free hosting for public repositories

### Custom Server

Upload all files to your web server's public directory. Ensure:
- All files maintain their relative paths
- Server supports HTTPS (recommended)
- Proper MIME types are configured

## Analytics & Metrics

The website tracks key metrics for future commercialization:

### User Engagement
- Page views and unique visitors
- Time spent on site
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- Video completion rates

### Business Metrics
- Download conversion rates
- Contact form submissions
- External link clicks (papers, social media)
- Geographic distribution
- Device/browser analytics

### Technical Metrics
- Form field interactions
- Navigation patterns
- Error tracking
- Performance metrics

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized CSS with minimal dependencies
- Efficient JavaScript with event delegation
- Responsive images and SVG graphics
- Fast loading with modern web standards

## Security

- No external dependencies (except Google Fonts and Analytics)
- Form validation and sanitization
- HTTPS recommended for production
- No sensitive data stored in localStorage

## Maintenance

### Regular Updates
- Update analytics tracking as needed
- Refresh content and testimonials
- Monitor download links and forms
- Update browser compatibility

### Monitoring
- Check analytics dashboard regularly
- Monitor form submissions
- Track download success rates
- Review user feedback

## Support

For questions or issues:
- Check browser console for errors
- Verify all file paths are correct
- Ensure proper server configuration
- Test on multiple devices and browsers

## License

This website template is created for Dhaani. Customize as needed for your specific requirements.
