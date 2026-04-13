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
    initSearch();
    initCustomSelects();
    renderBlogs();
});

// --- Blogs Rendering ---
const renderBlogs = () => {
    const grid = document.getElementById('blogsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Show only the latest 3 blogs on the home page
    const latestBlogs = blogs.slice(0, 3);
    
    latestBlogs.forEach(b => {
        grid.innerHTML += `
            <article class="blog-card">
                <img src="${b.image}" alt="${b.title}" class="blog-card-img" loading="lazy" />
                <div class="blog-card-body">
                    <span class="blog-date">${b.date}</span>
                    <h3 class="blog-title">${b.title}</h3>
                    <p class="blog-excerpt">${b.excerpt || 'Discover the latest trends and investment opportunities in Islamabad.'}</p>
                    <a href="blog-post.html?id=${b.id}" class="blog-read-more">Read Article <span>→</span></a>
                </div>
            </article>
        `;
    });
    
    // Add "View All" button if there are many blogs
    if (blogs.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.style.gridColumn = '1 / -1';
        wrapper.style.textAlign = 'center';
        wrapper.style.padding = '2rem 0';
        wrapper.innerHTML = `<a href="blog.html" class="nav-cta" style="display:inline-block">View All Insights</a>`;
        grid.appendChild(wrapper);
    }
};

// --- Brand & Contact Info ---
const initBrandInfo = () => {
    // Update Phone/WhatsApp links
    document.querySelectorAll('.conf-phone').forEach(el => {
        el.textContent = config.contact.phone;
        if (el.tagName === 'A') el.href = `tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`;
    });

    document.querySelectorAll('.conf-address').forEach(el => {
        if (el.textContent.trim() !== config.contact.address.trim()) {
            el.textContent = config.contact.address;
        }
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
const renderProperties = (filters = 'all') => {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    let filtered;
    if (filters === 'all') {
        filtered = listings;
    } else if (typeof filters === 'string') {
        filtered = listings.filter(p => p.category === filters);
    } else {
        // Advanced filters from search bar
        filtered = listings.filter(p => {
            const matchesType = !filters.type || p.type.toLowerCase() === filters.type.toLowerCase();
            const matchesSector = !filters.sector || p.location.toLowerCase().includes(filters.sector.toLowerCase());
            return matchesType && matchesSector;
        });
    }

    if (filtered.length === 0) {
        let sectorQuery = "";
        let whatsappQuery = "Hi Highmark Associates, I'm looking for properties";
        
        if (typeof filters === 'object') {
            if (filters.type) whatsappQuery += ` like a ${filters.type}`;
            if (filters.sector) {
                whatsappQuery += ` in ${filters.sector}`;
                sectorQuery = filters.sector;
            }
        }
        whatsappQuery += ". Can you help me find something?";

        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sectorQuery || 'Islamabad Real Estate')}`;
        const waLink = `https://wa.me/923178090809?text=${encodeURIComponent(whatsappQuery)}`;

        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px dashed rgba(184, 150, 62, 0.3); border-radius: var(--radius);">
                <div style="font-size: 3rem; margin-bottom: 1.5rem;">🏘️</div>
                <h3 style="margin-bottom: 1rem;">No Exact Matches Found</h3>
                <p style="color: var(--text-dim); margin-bottom: 2.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                    We couldn't find an exact match on our website for this specific search. However, we have many more off-market properties available.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="${mapsLink}" target="_blank" class="btn-conv" style="background: transparent; border: 1px solid var(--gold); display: flex; align-items: center; gap: 0.5rem;">
                        📍 View ${sectorQuery || 'Area'} on Map
                    </a>
                    <a href="${waLink}" target="_blank" class="btn-conv" style="background: var(--accent-green); border: none; display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.011 2c-5.505 0-9.989 4.484-9.989 9.989 0 1.758.459 3.41 1.259 4.85l-1.336 4.882 4.996-1.311c1.405.764 3.003 1.2 4.693 1.2 5.505 0 10.011-4.484 10.011-9.989 0-5.505-4.506-9.989-10.035-9.989zm5.304 14.125c-.225.63-1.3 1.233-1.787 1.309-.434.067-.98.125-2.825-.615-2.355-.945-3.87-3.325-3.987-3.484-.117-.16-1.025-1.349-1.025-2.583a2.64 2.64 0 01.815-1.956c.258-.258.558-.325.742-.325.183 0 .367.009.525.017.167.008.392-.067.617.475.225.542.775 1.884.842 2.017.067.133.111.291.017.475-.083.183-.133.291-.258.441-.125.15-.262.333-.375.45-.125.133-.25.275-.108.517.142.242.633 1.042 1.366 1.692.942.841 1.734 1.1 1.984 1.225.25.125.392.108.542-.058.15-.167.642-.75.815-1.008.167-.258.333-.217.558-.133.225.083 1.433.675 1.683.8.25.125.417.183.475.291.058.108.058.625-.167 1.258z"/></svg>
                        Enquire on WhatsApp
                    </a>
                </div>
            </div>
        `;
        return;
    }

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
        
        const openModal = (e) => {
            // Don't open if tapping the heart save button
            if (e.target.classList.contains('card-save') || e.target.closest('.card-save')) return;
            window.openPropertyModal(p);
        };

        card.addEventListener('click', openModal);
        // Explicit touchend for mobile safari / android browsers
        let touchMoved = false;
        card.addEventListener('touchstart', () => { touchMoved = false; }, { passive: true });
        card.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
        card.addEventListener('touchend', (e) => {
            if (!touchMoved) openModal(e);
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

const initSearch = () => {
    const searchBtn = document.getElementById('searchBtn');
    if (!searchBtn) return;

    searchBtn.addEventListener('click', () => {
        const typeSelect = document.getElementById('stype');
        const sectorSelect = document.getElementById('ssector');
        
        const type = typeSelect ? typeSelect.value : "";
        const sectorRaw = sectorSelect ? sectorSelect.value : "";
        
        // Clean sector name for matching (e.g. "E-11 Islamabad" -> "E-11")
        const sector = sectorRaw.split(' ')[0];

        renderProperties({ type, sector });
        
        // Scroll to results
        document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
    });
};

const initCustomSelects = () => {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        // Skip hidden selects or already wrapped ones
        if (select.classList.contains('native-select-hidden')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        // Inherit classes for styling (like contact-form-input)
        if (select.classList.contains('contact-form-input')) {
            wrapper.classList.add('contact-form-input');
        }

        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.textContent = select.options[select.selectedIndex]?.textContent || 'Select';

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-options';

        Array.from(select.options).forEach((option, index) => {
            const customOption = document.createElement('div');
            customOption.className = 'custom-option';
            customOption.textContent = option.textContent;
            if (index === select.selectedIndex) customOption.classList.add('selected');

            customOption.addEventListener('click', (e) => {
                e.stopPropagation();
                select.selectedIndex = index;
                select.dispatchEvent(new Event('change'));
                trigger.textContent = option.textContent;
                
                optionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                customOption.classList.add('selected');
                
                wrapper.classList.remove('open');
            });

            optionsContainer.appendChild(customOption);
        });

        // Toggle dropdown on wrapper click for larger target
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            if (!isOpen) wrapper.classList.add('open');
        });

        // Constructor
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);
        
        select.classList.add('native-select-hidden');

        // Sync custom UI if native select is changed programmatically
        select.addEventListener('change', () => {
            trigger.textContent = select.options[select.selectedIndex]?.textContent || 'Select';
            optionsContainer.querySelectorAll('.custom-option').forEach((opt, idx) => {
                if (idx === select.selectedIndex) opt.classList.add('selected');
                else opt.classList.remove('selected');
            });
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });
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
