import { listings as defaultListings } from './listings.js';
import { config as defaultConfig } from './config.js';
import { blogs as defaultBlogs } from './blogs.js';

let listings = JSON.parse(localStorage.getItem('hm_listings')) || defaultListings;
let config = JSON.parse(localStorage.getItem('hm_config')) || defaultConfig;
let blogs = JSON.parse(localStorage.getItem('hm_blogs')) || defaultBlogs;

document.addEventListener('DOMContentLoaded', () => {
    initBrandInfo();
    initPropertyGrid();
    initNavbar();
    initFilters();
    initUnitConverter();
    initForm();
    initAnimations();
    initPropertyModal();
    renderBlogs();
});

// --- Blogs Rendering ---
const renderBlogs = () => {
    const grid = document.getElementById('blogsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    blogs.forEach(b => {
        grid.innerHTML += `
            <article class="blog-card">
                <img src="${b.image}" alt="${b.title}" class="blog-img" loading="lazy" />
                <div class="blog-content">
                    <span class="blog-date">${b.date}</span>
                    <h3 class="blog-title">${b.title}</h3>
                    <p class="blog-desc">${b.content}</p>
                </div>
            </article>
        `;
    });
};

// --- Brand & Contact Info ---
const initBrandInfo = () => {
    // Update Phone/WhatsApp links
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

    // Update Brand Name
    document.querySelectorAll('.conf-brand-name').forEach(el => {
        el.textContent = config.brand.name;
    });
};

// --- Property Grid & Rendering ---
const renderProperties = (category = 'all') => {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // Filter properties based on category
    const filtered = category === 'all' 
        ? listings 
        : listings.filter(p => p.category === category);

    filtered.forEach(p => {
        const card = document.createElement('article');
        card.className = 'property-card';
        card.setAttribute('data-category', p.category);

        card.innerHTML = `
            <div class="card-img">
                <img src="${p.image}" alt="${p.title}" loading="lazy" />
                <div class="card-badge">
                    <span class="badge ${p.category === 'sale' ? 'badge-sale' : 'badge-rent'}">
                        ${p.category === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                    ${p.tags.map(tag => `<span class="badge badge-accent">${tag}</span>`).join('')}
                </div>
                <div class="card-save" onclick="this.textContent = this.textContent === '🤍' ? '❤️' : '🤍'">🤍</div>
            </div>
            <div class="card-body">
                <div class="card-price">${p.price} ${p.priceNote ? `<span>${p.priceNote}</span>` : ''}</div>
                <h3 class="card-title">${p.title}</h3>
                <div class="card-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>${p.location}</span>
                </div>
                <div class="card-specs">
                    ${Object.entries(p.specs).map(([key, val]) => `
                        <div class="spec">
                            <span class="spec-icon">${getSpecIcon(key)}</span>
                            ${val} ${key !== 'area' && isNaN(val) ? '' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-save')) return;
            window.openPropertyModal(p);
        });

        grid.appendChild(card);
    });
};

const getSpecIcon = (key) => {
    const icons = {
        area: '📐',
        beds: '🛏',
        baths: '🚿',
        type: '🏷',
        note: '📋',
        security: '🛡',
        usage: '🏢'
    };
    return icons[key] || '📍';
};

const initPropertyGrid = () => {
    renderProperties('all');
};

const initPropertyModal = () => {
    const modal = document.getElementById('propertyModal');
    const closeBtn = document.getElementById('closePropertyModal');
    
    if (!modal || !closeBtn) return;
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    window.openPropertyModal = (p) => {
        document.getElementById('pmodalMainImg').src = p.image;
        
        const galleryEl = document.getElementById('pmodalGallery');
        galleryEl.innerHTML = '';
        const fullGallery = [p.image].concat(Array.isArray(p.gallery) ? p.gallery : []);
        
        // Hide gallery tray if only 1 image
        galleryEl.style.display = fullGallery.length > 1 ? 'flex' : 'none';
        
        fullGallery.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.onclick = () => document.getElementById('pmodalMainImg').src = imgSrc;
            galleryEl.appendChild(img);
        });

        document.getElementById('pmodalTitle').textContent = p.title;
        document.getElementById('pmodalLocation').textContent = p.location;
        document.getElementById('pmodalPrice').textContent = p.price + (p.priceNote ? ` ${p.priceNote}` : '');
        document.getElementById('pmodalArea').textContent = p.specs.area || '-';
        document.getElementById('pmodalBeds').textContent = p.specs.beds || '-';
        document.getElementById('pmodalBaths').textContent = p.specs.baths || '-';
        document.getElementById('pmodalDesc').textContent = p.description || 'No additional description provided for this property.';
        
        const typeBadge = document.getElementById('pmodalType');
        typeBadge.className = `badge ${p.category === 'sale' ? 'badge-sale' : 'badge-rent'}`;
        typeBadge.textContent = p.category === 'sale' ? 'For Sale' : 'For Rent';

        const waBase = config.social && config.social.whatsappLink ? config.social.whatsappLink : `https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, '')}`;
        const waText = encodeURIComponent(`Hi Highmark Associates, I am interested in your property: *${p.title}* (${p.price}). Please send me more details. Location: ${p.location}`);
        document.getElementById('pmodalWhatsApp').href = `${waBase}?text=${waText}`;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
};

// --- Filters ---
const initFilters = () => {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderProperties(tab.getAttribute('data-filter'));
        });
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

    const toggleNav = () => {
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleNav);
    closeBtn.addEventListener('click', toggleNav);

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
};

// --- Unit Converter ---
const initUnitConverter = () => {
    const convertBtn = document.getElementById('convertBtn');
    const input = document.getElementById('marlaInput');
    const resultEl = document.getElementById('converterResult');
    const valueEl = document.getElementById('resultValue');

    const convert = () => {
        const marla = parseFloat(input.value);
        if (isNaN(marla) || marla <= 0) {
            valueEl.textContent = 'Enter a valid number';
            resultEl.classList.add('show');
            return;
        }

        const sqFt = (marla * 272.25).toLocaleString(undefined, { maximumFractionDigits: 0 });
        const sqM = (marla * 25.29).toFixed(1);
        const kanal = (marla / 20).toFixed(2);

        valueEl.innerHTML = `
            <div>${sqFt} sq.ft</div>
            <div class="result-subtext">${sqM} m² · ${kanal} Kanal</div>
        `;
        resultEl.classList.add('show');
    };

    convertBtn.addEventListener('click', convert);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') convert();
    });
};

// --- Contact Form ---
const initForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Enquiry Sent! ✓';
        btn.classList.add('success');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('success');
            form.reset();
        }, 4000);
    });
};

// --- Animations ---
const initAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
};
