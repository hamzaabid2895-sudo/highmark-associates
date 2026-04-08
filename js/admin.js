import { listings as defaultListings } from './listings.js';
import { config as defaultConfig } from './config.js';
import { blogs as defaultBlogs } from './blogs.js';

let listings = JSON.parse(localStorage.getItem('hm_listings')) || defaultListings;
let config = JSON.parse(localStorage.getItem('hm_config')) || defaultConfig;
let blogs = JSON.parse(localStorage.getItem('hm_blogs')) || defaultBlogs;

const ADMIN_PASS = "admin123";

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTabs();
    renderAdminListings();
    initForms();
    initExport();
    renderAdminBlogs();
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
            tabTitle.textContent = item.textContent.replace('🏠 ', '').replace('📱 ', '').replace('💾 ', '').replace('📰 ', '');
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
    document.getElementById('limg').value = p.image || "";
    const imgPreview = document.getElementById('imgPreview');
    if (p.image) {
        imgPreview.src = p.image;
        imgPreview.style.display = 'block';
    } else {
        imgPreview.style.display = 'none';
        imgPreview.src = '';
    }
    document.getElementById('limgFile').value = '';

    document.getElementById('larea').value = p.specs.area || "";
    document.getElementById('lbeds').value = p.specs.beds || "";
    document.getElementById('lbaths').value = p.specs.baths || "";
    document.getElementById('ldesc').value = p.description || "";
    
    // Gallery
    document.getElementById('lgalleryFile').value = '';
    const hiddenGalleryInput = document.getElementById('lgallery');
    const galleryPreview = document.getElementById('galleryPreview');
    hiddenGalleryInput.value = p.gallery ? JSON.stringify(p.gallery) : "[]";
    renderGalleryPreview();

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
    // Image Upload Handling
    const imgFileInput = document.getElementById('limgFile');
    const imgPreview = document.getElementById('imgPreview');
    const hiddenImgInput = document.getElementById('limg');

    imgFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedDataUrl = await compressImage(file);
                hiddenImgInput.value = compressedDataUrl;
                imgPreview.src = compressedDataUrl;
                imgPreview.style.display = 'block';
            } catch (error) {
                console.error("Image processing error:", error);
                alert("Failed to process image. Please try again with a smaller file.");
            }
        }
    });

    // Gallery Upload Handling
    const galleryFileInput = document.getElementById('lgalleryFile');
    const hiddenGalleryInput = document.getElementById('lgallery');
    
    window.renderGalleryPreview = () => {
        const galleryPreview = document.getElementById('galleryPreview');
        galleryPreview.innerHTML = '';
        try {
            const arr = JSON.parse(hiddenGalleryInput.value || "[]");
            arr.forEach((imgSrc, index) => {
                const wrap = document.createElement('div');
                wrap.style.position = 'relative';
                wrap.innerHTML = `
                    <img src="${imgSrc}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.1);" />
                    <button type="button" onclick="removeGalleryImage(${index})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border-radius:50%; width:20px; height:20px; font-size:10px; display:flex; align-items:center; justify-content:center;">✕</button>
                `;
                galleryPreview.appendChild(wrap);
            });
        } catch(e) {}
    };

    window.removeGalleryImage = (index) => {
        try {
            const arr = JSON.parse(hiddenGalleryInput.value || "[]");
            arr.splice(index, 1);
            hiddenGalleryInput.value = JSON.stringify(arr);
            renderGalleryPreview();
        } catch(e) {}
    };

    galleryFileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                let currentGallery = JSON.parse(hiddenGalleryInput.value || "[]");
                for (const file of files) {
                    const compressedDataUrl = await compressImage(file);
                    currentGallery.push(compressedDataUrl);
                }
                hiddenGalleryInput.value = JSON.stringify(currentGallery);
                renderGalleryPreview();
            } catch (error) {
                console.error("Gallery processing error:", error);
                alert("Failed to process some gallery images.");
            }
        }
    });

    // Show Modal
    document.getElementById('addListingBtn').addEventListener('click', () => {
        document.getElementById('listingForm').reset();
        document.getElementById('editId').value = "";
        
        imgPreview.style.display = 'none';
        imgPreview.src = "";
        hiddenImgInput.value = "";
        hiddenGalleryInput.value = "[]";
        renderGalleryPreview();
        
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
        let galleryArr = [];
        try { galleryArr = JSON.parse(document.getElementById('lgallery').value || "[]"); } catch(e) {}

        const newListing = {
            id: editId ? parseInt(editId) : Date.now(),
            category: document.getElementById('lcat').value,
            type: document.getElementById('lcat').value === 'sale' ? 'House' : 'Apartment',
            title: document.getElementById('ltitle').value,
            location: document.getElementById('lloc').value,
            price: document.getElementById('lprice').value,
            priceNote: "",
            image: document.getElementById('limg').value,
            description: document.getElementById('ldesc').value,
            gallery: galleryArr,
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

// --- Blogs CRUD (standalone, called after DOM is ready) ---
const renderAdminBlogs = () => {
    const body = document.getElementById('blogsBody');
    if (!body) return;
    body.innerHTML = '';

    blogs.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${b.image}" class="img-preview" /></td>
            <td><strong>${b.title}</strong><br><small>${b.date}</small></td>
            <td>
                <button class="btn-action btn-edit" onclick="window.editBlog('${b.id}')">Edit</button>
                <button class="btn-action btn-delete" onclick="window.deleteBlog('${b.id}')">Delete</button>
            </td>
        `;
        body.appendChild(tr);
    });
};

const saveBlogsAndRefresh = () => {
    localStorage.setItem('hm_blogs', JSON.stringify(blogs));
    renderAdminBlogs();
};

window.editBlog = (id) => {
    const b = blogs.find(item => item.id == id);
    if (!b) return;

    document.getElementById('bEditId').value = b.id;
    document.getElementById('btitle').value = b.title;
    document.getElementById('bcontent').value = b.content;
    document.getElementById('bimg').value = b.image || "";
    
    const preview = document.getElementById('bimgPreview');
    if (b.image) {
        preview.src = b.image;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('bModalTitle').textContent = "Edit Blog";
    document.getElementById('blogModal').classList.add('open');
};

window.deleteBlog = (id) => {
    if (confirm('Delete this blog post?')) {
        blogs = blogs.filter(item => item.id != id);
        saveBlogsAndRefresh();
    }
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

    document.getElementById('exportBlogs')?.addEventListener('click', () => {
        const content = `export const blogs = ${JSON.stringify(blogs, null, 2)};`;
        preview.value = content;
        downloadFile('blogs.js', content);
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

// --- Image Compression Utility ---
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Optimal width for cards
                const scaleSize = MAX_WIDTH / img.width;
                
                // Only scale if image is larger than MAX_WIDTH
                if (scaleSize < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Compress to 70% quality JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            }
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};
