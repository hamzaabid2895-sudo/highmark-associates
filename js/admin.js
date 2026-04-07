import { listings as defaultListings } from './listings.js';
import { config as defaultConfig } from './config.js';

let listings = JSON.parse(localStorage.getItem('hm_listings')) || defaultListings;
let config = JSON.parse(localStorage.getItem('hm_config')) || defaultConfig;

const ADMIN_PASS = "admin123";

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTabs();
    renderAdminListings();
    initForms();
    initExport();
});

// --- Authentication ---
const initAuth = () => {
    const form = document.getElementById('loginForm');
    const overlay = document.getElementById('loginOverlay');
    const wrapper = document.getElementById('adminWrapper');

    if (sessionStorage.getItem('hm_auth')) {
        overlay.style.display = 'none';
        wrapper.style.display = 'flex';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPass').value;
        if (pass === ADMIN_PASS) {
            sessionStorage.setItem('hm_auth', 'true');
            overlay.style.display = 'none';
            wrapper.style.display = 'flex';
        } else {
            alert('Incorrect Password');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('hm_auth');
        window.location.reload();
    });
};

// --- Tab Navigation ---
const initTabs = () => {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabs = document.querySelectorAll('.admin-tab-content');
    const tabTitle = document.getElementById('tabTitle');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!item.dataset.tab) return;
            
            navItems.forEach(i => i.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(item.dataset.tab).classList.add('active');
            tabTitle.textContent = item.textContent.replace('🏠 ', '').replace('📱 ', '').replace('💾 ', '');
        });
    });
};

// --- Listings Management ---
const renderAdminListings = () => {
    const body = document.getElementById('listingsBody');
    body.innerHTML = '';

    listings.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" class="img-preview" /></td>
            <td><strong>${p.title}</strong><br><small>${p.location}</small></td>
            <td><span class="status-pill">${p.type}</span></td>
            <td>${p.price}</td>
            <td>${p.category.toUpperCase()}</td>
            <td>
                <button class="btn-action btn-edit" onclick="window.editListing(${p.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="window.deleteListing(${p.id})">Delete</button>
            </td>
        `;
        body.appendChild(tr);
    });
};

window.editListing = (id) => {
    const p = listings.find(item => item.id === id);
    if (!p) return;

    document.getElementById('editId').value = p.id;
    document.getElementById('ltitle').value = p.title;
    document.getElementById('lcat').value = p.category;
    document.getElementById('lprice').value = p.price;
    document.getElementById('lloc').value = p.location;
    document.getElementById('limg').value = p.image;
    document.getElementById('larea').value = p.specs.area || "";
    document.getElementById('lbeds').value = p.specs.beds || "";
    document.getElementById('lbaths').value = p.specs.baths || "";

    document.getElementById('modalTitle').textContent = "Edit Property Details";
    document.getElementById('listingModal').classList.add('open');
};

window.deleteListing = (id) => {
    if (confirm('Are you sure you want to delete this listing?')) {
        listings = listings.filter(item => item.id !== id);
        saveAndRefresh();
    }
};

const initForms = () => {
    // Show Modal
    document.getElementById('addListingBtn').addEventListener('click', () => {
        document.getElementById('listingForm').reset();
        document.getElementById('editId').value = "";
        document.getElementById('modalTitle').textContent = "Add Property Listing";
        document.getElementById('listingModal').classList.add('open');
    });

    // Close Modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('listingModal').classList.remove('open');
    });

    // Handle Listing Form
    document.getElementById('listingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('editId').value;
        const newListing = {
            id: editId ? parseInt(editId) : Date.now(),
            category: document.getElementById('lcat').value,
            type: document.getElementById('lcat').value === 'sale' ? 'House' : 'Apartment',
            title: document.getElementById('ltitle').value,
            location: document.getElementById('lloc').value,
            price: document.getElementById('lprice').value,
            priceNote: "",
            image: document.getElementById('limg').value,
            specs: {
                area: document.getElementById('larea').value,
                beds: document.getElementById('lbeds').value,
                baths: document.getElementById('lbaths').value
            },
            tags: ["Verified"],
            featured: true
        };

        if (editId) {
            listings = listings.map(item => item.id === parseInt(editId) ? newListing : item);
        } else {
            listings.push(newListing);
        }

        saveAndRefresh();
        document.getElementById('listingModal').classList.remove('open');
    });

    // Handle Config Form
    const cForm = document.getElementById('configForm');
    cForm.phone.value = config.contact.phone;
    cForm.whatsapp.value = config.contact.whatsapp;
    cForm.email.value = config.contact.email;
    cForm.address.value = config.contact.address;

    cForm.addEventListener('submit', (e) => {
        e.preventDefault();
        config.contact.phone = cForm.phone.value;
        config.contact.whatsapp = cForm.whatsapp.value;
        config.contact.email = cForm.email.value;
        config.contact.address = cForm.address.value;
        
        localStorage.setItem('hm_config', JSON.stringify(config));
        alert('Credentials Updated Successfully!');
    });
};

const saveAndRefresh = () => {
    localStorage.setItem('hm_listings', JSON.stringify(listings));
    renderAdminListings();
};

// --- Export Functionality ---
const initExport = () => {
    const preview = document.getElementById('codePreview');

    document.getElementById('exportListings').addEventListener('click', () => {
        const content = `export const listings = ${JSON.stringify(listings, null, 2)};`;
        preview.value = content;
        downloadFile('listings.js', content);
    });

    document.getElementById('exportConfig').addEventListener('click', () => {
        const content = `export const config = ${JSON.stringify(config, null, 2)};`;
        preview.value = content;
        downloadFile('config.js', content);
    });
};

const downloadFile = (filename, text) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/javascript;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
