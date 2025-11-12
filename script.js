// Analytics and Interaction Functions
class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.init();
    }

    init() {
        // Track page load
        this.trackEvent('page_view', {
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        });

        // Track scroll depth
        this.trackScrollDepth();
        
        // Track time on page
        this.trackTimeOnPage();
        
        // Track form interactions
        this.trackFormInteractions();
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                referrer: document.referrer
            }
        };

        this.events.push(event);
        
        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Log to console for debugging
        console.log('Analytics Event:', event);
        
        // Store in localStorage for offline tracking
        this.storeEvent(event);
    }

    storeEvent(event) {
        try {
            const stored = JSON.parse(localStorage.getItem('dhaani_analytics') || '[]');
            stored.push(event);
            // Keep only last 100 events to prevent storage bloat
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }
            localStorage.setItem('dhaani_analytics', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store analytics event:', error);
        }
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 90, 100];
        const trackedThresholds = new Set();

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                        trackedThresholds.add(threshold);
                        this.trackEvent('scroll_depth', {
                            depth_percent: threshold,
                            max_scroll: maxScroll
                        });
                    }
                });
            }
        };

        window.addEventListener('scroll', trackScroll, { passive: true });
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        
        // Track time milestones
        const timeThresholds = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
        const trackedTimes = new Set();

        const checkTime = () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            timeThresholds.forEach(threshold => {
                if (timeOnPage >= threshold && !trackedTimes.has(threshold)) {
                    trackedTimes.add(threshold);
                    this.trackEvent('time_on_page', {
                        seconds: threshold,
                        total_seconds: timeOnPage
                    });
                }
            });
        };

        // Check every 10 seconds
        setInterval(checkTime, 10000);
        
        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('page_exit', {
                total_time_seconds: totalTime
            });
        });
    }

    trackFormInteractions() {
        // Track form field interactions
        document.addEventListener('focus', (e) => {
            const target = e.target;
            if (!target) {
                return;
            }

            const matches =
                target.matches ||
                target.matchesSelector ||
                target.msMatchesSelector ||
                target.webkitMatchesSelector;

            if (typeof matches === 'function' && matches.call(target, 'input, textarea, select')) {
                this.trackEvent('form_field_focus', {
                    field_name: target.name || target.id,
                    field_type: target.type || target.tagName.toLowerCase()
                });
            }
        }, true);

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                form_id: e.target.id,
                form_action: e.target.action
            });
        });
    }

    // Download tracking
    trackDownload(source, platform = null) {
        this.trackEvent('download_click', {
            source: source,
            platform: platform,
            download_type: 'application'
        });
    }

    // Video interaction tracking
    trackVideoClick() {
        this.trackEvent('video_click', {
            video_type: 'demo',
            video_status: 'placeholder'
        });
    }

    // Paper link tracking
    trackPaperClick(paperId) {
        this.trackEvent('paper_click', {
            paper_id: paperId,
            paper_type: 'research'
        });
    }

    // Contact form tracking
    trackContactFormSubmit(formData) {
        this.trackEvent('contact_form_submit', {
            form_fields: Object.keys(formData),
            has_message: !!formData.message,
            message_length: formData.message ? formData.message.length : 0
        });
    }

    // Get analytics data for export
    getAnalyticsData() {
        return {
            events: this.events,
            stored_events: JSON.parse(localStorage.getItem('dhaani_analytics') || '[]'),
            session_info: {
                start_time: new Date().toISOString(),
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                referrer: document.referrer
            }
        };
    }
}

// Initialize analytics tracker
const analytics = new AnalyticsTracker();

let youtubeAPIRequested = false;
let youtubeAPIQueue = [];
let demoVideoPlayer = null;
const DOWNLOAD_EMAIL_STORAGE_KEY = 'dhaani_download_email_opt_in';
let pendingDownloadContext = null;
const EMAILJS_SERVICE_ID = 'service_3shr5xc';
const EMAILJS_CONTACT_TEMPLATE_ID = 'template_hdsgry6';
const EMAILJS_DOWNLOAD_TEMPLATE_ID = EMAILJS_CONTACT_TEMPLATE_ID; // reuse contact template for opt-in notifications
const EMAILJS_ADMIN_EMAIL = 'shraddha.surana@gmail.com';
const DOWNLOAD_LINKS = {
    mac: [
        {
            url: 'https://github.com/ShraddhaSurana/dhaani/releases/download/v0.1.0/Dhaani-0.1.0-arm64.dmg',
            filename: 'Dhaani-0.1.0-arm64.dmg',
            label: 'Dhaani macOS installer (DMG)'
        },
        {
            url: 'public/mac/Install_Dhaani.command',
            filename: 'Install_Dhaani.command',
            label: 'Helper installer script'
        },
        {
            url: 'public/mac/INSTALL_INSTRUCTIONS.md',
            filename: 'INSTALL_INSTRUCTIONS.md',
            label: 'Installation instructions'
        }
    ],
    windows: [
        {
            url: 'https://github.com/ShraddhaSurana/dhaani/releases/download/v0.1.0/Dhaani.Setup.0.1.0.exe',
            filename: 'Dhaani.Setup.0.1.0.exe',
            label: 'Windows installer'
        }
    ],
    linux: [
        {
            url: 'https://github.com/ShraddhaSurana/dhaani/releases/download/v0.1.0/Dhaani-0.1.0.AppImage',
            filename: 'Dhaani-0.1.0.AppImage',
            label: 'Linux AppImage'
        }
    ]
};

function ensureYouTubeAPI(callback) {
    if (window.YT && typeof window.YT.Player === 'function') {
        callback();
        return;
    }

    youtubeAPIQueue.push(callback);

    if (youtubeAPIRequested) return;
    youtubeAPIRequested = true;

    const existingHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
        if (typeof existingHandler === 'function') {
            existingHandler();
        }
        youtubeAPIQueue.forEach(cb => {
            try {
                cb();
            } catch (error) {
                console.warn('YouTube API callback failed:', error);
            }
        });
        youtubeAPIQueue = [];
    };

    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://www.youtube.com/iframe_api';
    scriptTag.async = true;
    document.head.appendChild(scriptTag);
}

function setupDemoVideoPlayer() {
    const iframe = document.getElementById('demoVideoIframe');
    if (!iframe || iframe.dataset.playerInitialized === 'true') {
        return;
    }

    const desiredVolume = Number(iframe.dataset.volume || 35);

    ensureYouTubeAPI(() => {
        demoVideoPlayer = new YT.Player('demoVideoIframe', {
            events: {
                onReady: () => {
                    try {
                        const volume = Math.min(Math.max(desiredVolume, 0), 100);
                        demoVideoPlayer.setVolume(volume);
                    } catch (error) {
                        console.warn('Failed to set demo video volume:', error);
                    }
                }
            }
        });
    });

    iframe.dataset.playerInitialized = 'true';
}

// Global functions for HTML onclick events
function trackDownload(source, platform = null) {
    analytics.trackDownload(source, platform);
    
    const button = typeof event !== 'undefined' ? event.target.closest('button') : null;
    if (!button) {
        return;
    }
    
    const originalText = button.textContent;
    button.textContent = 'Downloading...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        console.log(`Download triggered from ${source} for ${platform || 'unknown platform'}`);
    }, 1000);
}

function trackVideoClick() {
    analytics.trackVideoClick();
    
    // Add visual feedback
    const playButton = event.target.closest('.play-button');
    if (playButton) {
        playButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            playButton.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Here you would load the actual YouTube video
    console.log('Video click tracked - would load YouTube video');
}

function trackPaperClick(paperId) {
    analytics.trackPaperClick(paperId);
    console.log(`Paper ${paperId} clicked - opening in new tab`);
}

function scrollToVideo() {
    analytics.trackEvent('scroll_to_video');
    document.getElementById('demo-video').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function scrollToDownloadSection(source = 'hero') {
    analytics.trackEvent('download_cta_click', { source });
    document.getElementById('download').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function handleDownloadClick(event, platform) {
    const card = event.currentTarget?.classList?.contains('platform-card')
        ? event.currentTarget
        : event.target.closest('.platform-card');
    const button = card?.querySelector('.platform-btn');
    
    pendingDownloadContext = { platform, button };
    analytics.trackEvent('download_button_click', { platform });
    openDownloadOptInModal();
}

function openDownloadOptInModal() {
    const modal = document.getElementById('optInModal');
    if (!modal) {
        proceedWithDownload();
        return;
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    const emailInput = document.getElementById('downloadEmail');
    if (emailInput) {
        const savedEmail = localStorage.getItem(DOWNLOAD_EMAIL_STORAGE_KEY) || '';
        emailInput.value = savedEmail;
        setTimeout(() => emailInput.focus(), 50);
    }
}

function hideDownloadOptInModal() {
    const modal = document.getElementById('optInModal');
    if (!modal) {
        return;
    }
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    releaseBodyScrollIfNoActiveModals();
}

function handleDownloadEmailSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.opt-in-button');
    const originalButtonText = submitButton ? submitButton.textContent : null;
    
    const emailInput = document.getElementById('downloadEmail');
    if (!emailInput) {
        proceedWithDownload();
        return;
    }
    
    const email = emailInput.value.trim();
    if (!email) {
        showNotification('Add your email to receive tips—or choose Skip & download.', 'info');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'warning');
        return;
    }
    
    const platform = pendingDownloadContext?.platform || 'unknown';
    if (submitButton) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
    }
    
    const emailParams = {
        to_email: EMAILJS_ADMIN_EMAIL,
        from_name: 'Download Opt-In',
        from_email: email,
        subject: `Download tips opt-in (${platform})`,
        message: `Add ${email} to the download tips list.\nPlatform selected: ${platform}.\nSaved locally on user device.`,
        reply_to: email
    };
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_DOWNLOAD_TEMPLATE_ID, emailParams)
        .then(() => {
            localStorage.setItem(DOWNLOAD_EMAIL_STORAGE_KEY, email);
            analytics.trackEvent('download_email_opt_in', {
                provided_email: true,
                platform
            });
            showNotification('Thanks! We\'ll send advanced tips and the optional survey invite when ready.', 'success');
            if (submitButton) {
                submitButton.textContent = originalButtonText || 'Send me tips + download';
                submitButton.disabled = false;
            }
            proceedWithDownload({ viaOptIn: true });
        })
        .catch(error => {
            console.error('Failed to send download opt-in email:', error);
            showNotification('Could not send the opt-in email yet. Please try again or skip for now.', 'error');
            if (submitButton) {
                submitButton.textContent = originalButtonText || 'Send me tips + download';
                submitButton.disabled = false;
            }
        });
}

function handleDownloadSkip() {
    analytics.trackEvent('download_email_opt_in_skipped', {
        platform: pendingDownloadContext?.platform || 'unknown'
    });
    proceedWithDownload({ viaOptIn: false });
}

function proceedWithDownload({ viaOptIn = false } = {}) {
    const context = pendingDownloadContext;
    hideDownloadOptInModal();
    
    if (!context) {
        showNotification('Choose a platform to start the download.', 'info');
        return;
    }
    
    const { platform, button } = context;
    pendingDownloadContext = null;
    
    const emailSaved = !!localStorage.getItem(DOWNLOAD_EMAIL_STORAGE_KEY);
    trackDownload('download_section', platform);
    analytics.trackEvent('download_attempt', {
        platform,
        provided_email: viaOptIn,
        email_saved: emailSaved
    });
    
    const filesToDownload = DOWNLOAD_LINKS[platform] || [];
    if (!filesToDownload.length) {
        showNotification('Download links for this platform are coming soon.', 'warning');
        return;
    }
    
    filesToDownload.forEach((file, index) => {
        setTimeout(() => triggerFileDownload(file.url, file.filename), index * 250);
    });
    
    if (platform === 'mac') {
        showMacInstallModal();
    }
    
    if (button) {
        const originalText = button.textContent;
        button.textContent = viaOptIn ? 'Sending tips...' : 'Preparing download...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            showNotification('Download will start shortly—check your browser or Downloads folder.', 'success');
            console.log(`Download triggered from download_section for ${platform || 'unknown platform'}`);
        }, 1000);
    } else {
        setTimeout(() => {
            showNotification('Download will start shortly—check your browser or Downloads folder.', 'success');
            console.log(`Download triggered from download_section for ${platform || 'unknown platform'}`);
        }, 500);
    }
}

function triggerFileDownload(url, filename) {
    if (!url) {
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        if (filename && isSameOrigin(url)) {
            link.download = filename;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Failed to trigger download:', url, error);
        window.open(url, '_blank', 'noopener');
    }
}

function isSameOrigin(url) {
    try {
        const parsed = new URL(url, window.location.href);
        return parsed.origin === window.location.origin;
    } catch (error) {
        console.warn('Could not parse URL for origin comparison:', url, error);
        return false;
    }
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showMacInstallModal() {
    const modal = document.getElementById('macInstallModal');
    if (!modal) {
        return;
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function hideMacInstallModal() {
    const modal = document.getElementById('macInstallModal');
    if (!modal) {
        return;
    }
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    releaseBodyScrollIfNoActiveModals();
}

function releaseBodyScrollIfNoActiveModals() {
    const activeModal = document.querySelector('.opt-in-modal.active');
    if (!activeModal) {
        document.body.classList.remove('modal-open');
    }
}

// Contact form handling
function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Track form submission
    analytics.trackContactFormSubmit(data);
    
    // Show loading state
    const submitButton = event.target.querySelector('.form-submit');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Prepare email parameters
    const emailParams = {
        to_email: EMAILJS_ADMIN_EMAIL,
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        reply_to: data.email
    };
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, emailParams)
        .then(function(response) {
            // Success
            console.log('Email sent successfully!', response.status, response.text);
            
            // Reset form
            event.target.reset();
            submitButton.textContent = 'Message Sent!';
            submitButton.style.background = '#10b981';
            
            // Show success message
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.background = '';
            }, 3000);
        }, function(error) {
            // Error
            console.error('Failed to send email:', error);
            
            submitButton.textContent = 'Failed to Send';
            submitButton.style.background = '#ef4444';
            
            // Show error message
            showNotification('Failed to send message. Please try again in some time', 'error');
            
            // Reset button after 5 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.background = '';
            }, 5000);
        });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#0891b2',
        warning: '#f59e0b'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    setupDemoVideoPlayer();
    
    const optInModal = document.getElementById('optInModal');
    if (optInModal) {
        optInModal.addEventListener('click', (e) => {
            if (e.target === optInModal) {
                handleDownloadSkip();
            }
        });
    }
    
    const macInstallModal = document.getElementById('macInstallModal');
    if (macInstallModal) {
        macInstallModal.addEventListener('click', (e) => {
            if (e.target === macInstallModal) {
                hideMacInstallModal();
            }
        });
    }
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideDownloadOptInModal();
            hideMacInstallModal();
        }
    });
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Track navigation clicks
                analytics.trackEvent('navigation_click', {
                    target_section: this.getAttribute('href').substring(1)
                });
            }
        });
    });
    
    // Add intersection observer for section visibility tracking
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                analytics.trackEvent('section_view', {
                    section: entry.target.id || entry.target.className,
                    section_title: entry.target.querySelector('h2, h3')?.textContent || 'Unknown'
                });
            }
        });
    }, observerOptions);
    
    // Observe all main sections
    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Track external link clicks
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            analytics.trackEvent('external_link_click', {
                url: this.href,
                link_text: this.textContent.trim()
            });
        });
    });
});

// Utility function to export analytics data (for debugging/admin use)
function exportAnalyticsData() {
    const data = analytics.getAnalyticsData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dhaani-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Make analytics available globally for debugging
window.analytics = analytics;
window.exportAnalyticsData = exportAnalyticsData;
