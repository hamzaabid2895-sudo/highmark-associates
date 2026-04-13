import { blogs as defaultBlogs } from './blogs.js';
import { config as defaultConfig } from './config.js';

let config = JSON.parse(localStorage.getItem('hm_config')) || defaultConfig;
let blogs = JSON.parse(localStorage.getItem('hm_blogs')) || defaultBlogs;

document.addEventListener('DOMContentLoaded', () => {
    initBrandInfo();
    initNavbar();
    
    // Check which page we are on
    const path = window.location.pathname;
    const isPostPage = path.includes('blog-post.html') || window.location.search.includes('id=');
    const isBlogArchive = path.includes('blog.html') || (!isPostPage && path.endsWith('/blog'));
    
    if (isPostPage) {
        renderBlogPost();
    } else {
        renderBlogList();
    }
});

// --- Brand & Contact Info ---
const initBrandInfo = () => {
    document.querySelectorAll('.conf-phone').forEach(el => {
        el.textContent = config.contact.phone;
        if (el.tagName === 'A') el.href = `tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`;
    });
    document.querySelectorAll('.conf-address').forEach(el => {
        el.textContent = config.contact.address;
    });
    document.querySelectorAll('.conf-whatsapp-link').forEach(el => {
        if (el.tagName === 'A') el.href = config.social.whatsappLink;
    });
};

// --- Navbar & Navigation ---
const initNavbar = () => {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const hamburger = document.querySelector('.nav-hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const closeBtn = document.querySelector('.mobile-close');

    if (hamburger && mobileNav && closeBtn) {
        const toggleNav = () => {
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        };

        hamburger.addEventListener('click', toggleNav);
        closeBtn.addEventListener('click', toggleNav);

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }
};

// --- Render Blog List (blog.html) ---
const renderBlogList = () => {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    grid.innerHTML = '';

    blogs.forEach(blog => {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.innerHTML = `
            <img src="${blog.image}" alt="${blog.title}" class="blog-card-img" loading="lazy" />
            <div class="blog-card-body">
                <div class="blog-date">${blog.date}</div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.excerpt || 'Read the full article to learn more and explore expert real estate insights.'}</p>
                <a href="blog-post.html?id=${blog.id}" class="blog-read-more">Read Article <span>→</span></a>
            </div>
        `;
        grid.appendChild(card);
    });
};

// --- Render Single Post (blog-post.html) ---
const renderBlogPost = () => {
    const container = document.getElementById('articleContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px 0;">
                <h2>Article Not Found</h2>
                <p>The requested article could not be found.</p>
                <a href="blog.html" class="nav-cta" style="display: inline-block; margin-top: 2rem;">Back to Blog</a>
            </div>
        `;
        return;
    }

    // Set Page Title
    document.title = `${blog.title} | Highmark Associates`;

    container.innerHTML = `
        <div class="article-header">
            <div class="article-meta">${blog.date} &nbsp; • &nbsp; MARKET INTELLIGENCE</div>
            <h1 class="article-title">${blog.title}</h1>
        </div>
        <img src="${blog.image}" alt="${blog.title}" class="article-hero-img" />
        <div class="article-content">
            ${blog.content}
        </div>
        <div style="text-align: center; margin-top: 5rem;">
            <a href="blog.html" class="nav-cta" style="display: inline-block;">← Back to All Articles</a>
        </div>
    `;
};
