// Global namespace for cart functions
window.RemboShoppers = window.RemboShoppers || {};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    if (document.querySelector('.cart-items')) {
        initCartPage();
    } else {
        initHomepage();
    }
    
    // initializations
    initCart();
    initMobileMenu();
    initSearch();
    initSmoothScroll();
    initAnimations();
    initProductCards();
    initNewsletter();
    initProfile();
    updateCartCount(); 
    initMobileMenu();
    initSearch();
    initSmoothScroll();
    initProfile();
    loadCart(); 
});

let cart = [];

window.RemboShoppers = {
    cart: cart,
    
    // Load cart from localStorage
    loadCart: function() {
        cart = JSON.parse(localStorage.getItem('remboCart')) || [];
        window.RemboShoppers.cart = cart;
        window.RemboShoppers.updateCartCount();
        return cart;
    },
    
    // Save cart to localStorage
    saveCart: function() {
        localStorage.setItem('remboCart', JSON.stringify(cart));
        window.RemboShoppers.cart = cart;
    },
    
    // Update cart count display (all pages)
        updateCartCount: function() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count elements
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = totalItems;
        });
        
        document.querySelectorAll('.cart-count span').forEach(el => {
            el.textContent = totalItems;
        });
        
        // Update cart items count on cart page
        const itemsCount = document.getElementById('cart-items-count');
        if (itemsCount) {
            itemsCount.textContent = totalItems;
        }
    },
    
    // Add item to cart
    addToCart: function(productName, price) {
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: productName,
                price: parseFloat(price),
                quantity: 1,
                image: this.getProductImage(productName) || 'https://via.placeholder.com/80x80?text=Product'
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        return true;
    },
    
    // Remove item from cart
    removeFromCart: function(productName) {
        const index = cart.findIndex(item => item.name === productName);
        if (index > -1) {
            cart.splice(index, 1);
            this.saveCart();
            this.updateCartCount();
            return true;
        }
        return false;
    },
    
    // Update item quantity on cart
    updateQuantity: function(productName, quantity) {
        const item = cart.find(item => item.name === productName);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeFromCart(productName);
            } else {
                this.saveCart();
                this.updateCartCount();
            }
            return true;
        }
        return false;
    },
    
    // Clear entire cart
    clearCart: function() {
        cart = [];
        this.saveCart();
        this.updateCartCount();
        return true;
    },
    
    
    getCartTotal: function() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
     
    getCartSummary: function() {
        const subtotal = this.getCartTotal();
        const shipping = subtotal >= 5000 ? 0 : 200;
        const discount = subtotal >= 10000 ? subtotal * 0.15 : 0;
        const total = subtotal + shipping - discount;
        
        return {
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total
        };
    },
    
     
    getProductImage: function(productName) {
        const images = {
            'Elegant Ladies Dress': 'Images/Women Solid Color 3D Floral Decor Ruffle Hem Elegant Camisole Dress, Graduation, Romantic, Elegant, Party, Flowy, Ruffle, Wedding Guest Dress, Prom, Formal, Bachelorette Club Outfits Women Dress,Valentine Outfits, .jpg',
            'Smart Sneakers': 'Images/close-up-futuristic-sneakers.jpg',
            'Luxury Perfume': 'Images/dark-glass-bottle-with-single-liquid-drop-generative-ai.jpg'
        };
        return images[productName] || '';
    }
};

function initHomepage() {
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productName = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            
            if (window.RemboShoppers.addToCart(productName, price)) {
                showAddToCartAnimation(this);
            }
        });
    });
    
    initAnimations();
}

function showAddToCartAnimation(button) {
    const buttonRect = button.getBoundingClientRect();
    const cartIcon = document.querySelector('.cart i');
    
    if (cartIcon) {
        const flyAnim = document.createElement('div');
        flyAnim.className = 'fly-to-cart';
        flyAnim.style.cssText = `
            position: fixed;
            left: ${buttonRect.left + window.scrollX}px;
            top: ${buttonRect.top + window.scrollY}px;
            z-index: 9999;
            font-size: 24px;
            pointer-events: none;
        `;
        flyAnim.innerHTML = '🛒';
        document.body.appendChild(flyAnim);
        
        const cartRect = cartIcon.getBoundingClientRect();
        gsap.to(flyAnim, {
            duration: 0.8,
            left: cartRect.left + window.scrollX + 'px',
            top: cartRect.top + window.scrollY + 'px',
            scale: 0.3,
            opacity: 0,
            ease: 'power2.out',
            onComplete: () => {
                document.body.removeChild(flyAnim);
                // Success confetti
                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 50,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            }
        });
    }
}

function initCartPage() {
    // Load and display cart
    window.RemboShoppers.loadCart();
    renderCartItems();
    updateCartSummary();
    
    // Add clear cart button
    addClearCartButton();
    
    // Event listeners for cart page
    document.addEventListener('click', function(e) {
        if (e.target.matches('.remove-item')) {
            const productName = e.target.dataset.product;
            if (window.RemboShoppers.removeFromCart(productName)) {
                renderCartItems();
                updateCartSummary();
                showNotification('Item removed from cart!', 'success');
            }
        }
        
        if (e.target.matches('.qty-btn')) {
            const productName = e.target.dataset.product;
            const currentQty = parseInt(e.target.parentElement.querySelector('input').value);
            const newQty = e.target.dataset.action === 'plus' ? currentQty + 1 : currentQty - 1;
            if (newQty > 0) {
                window.RemboShoppers.updateQuantity(productName, newQty);
                renderCartItems();
                updateCartSummary();
            }
        }
    });
}

function renderCartItems() {
    const cartContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartActions = document.getElementById('cart-actions');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        emptyCart.style.display = 'block';
        cartActions.style.display = 'none';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item" data-product="${item.name}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Product'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">KES ${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" data-product="${item.name}" data-action="minus">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button class="qty-btn" data-product="${item.name}" data-action="plus">+</button>
                </div>
                <div class="cart-item-total">
                    KES ${(item.price * item.quantity).toLocaleString()}
                </div>
                <button class="remove-item" data-product="${item.name}" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    cartContainer.style.display = 'block';
    emptyCart.style.display = 'none';
    cartActions.style.display = 'flex';
    checkoutBtn.style.display = 'block';
    
    // Animate items
    gsap.from('.cart-item', {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

function updateCartSummary() {
    const summary = window.RemboShoppers.getCartSummary();
    
    // Update order summary
    document.getElementById('cart-subtotal').textContent = `KES ${summary.subtotal.toLocaleString()}`;
    document.getElementById('shipping-cost').textContent = summary.shipping === 0 ? 'FREE' : `KES ${summary.shipping.toLocaleString()}`;
    document.getElementById('shipping-cost').className = summary.shipping === 0 ? 'free' : '';
    
    const discountRow = document.getElementById('discount-row');
    if (summary.discount > 0) {
        document.getElementById('discount-amount').textContent = `-KES ${summary.discount.toLocaleString()}`;
        discountRow.style.display = 'block';
    } else {
        discountRow.style.display = 'none';
    }
    
    document.getElementById('cart-total').textContent = `KES ${summary.total.toLocaleString()}`;
}

function addClearCartButton() {
    const cartHeader = document.querySelector('.cart-header');
    if (!document.getElementById('clear-cart-btn')) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clear-cart-btn';
        clearBtn.className = 'btn btn-danger clear-cart-btn';
        clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All Items';
        clearBtn.onclick = function() {
            if (confirm('Are you sure you want to clear all items from your cart?')) {
                window.RemboShoppers.clearCart();
                renderCartItems();
                updateCartSummary();
                showNotification('Cart cleared successfully!', 'success');
            }
        };
        cartHeader.appendChild(clearBtn);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    gsap.fromTo(notification, 
        { x: 300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    
    setTimeout(() => {
        gsap.to(notification, {
            x: 300,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => notification.remove()
        });
    }, 3000);
}

function initMobileMenu() {
    // Mobile hamburger menu logic (same as before)
    const nav = document.querySelector('nav');
    if (window.innerWidth <= 768 && !document.querySelector('.hamburger-menu')) {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger-menu';
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        hamburger.onclick = () => {
            document.querySelector('.nav-links').classList.toggle('mobile-open');
        };
        nav.appendChild(hamburger);
    }
}

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.location.href = `shop.html?search=${encodeURIComponent(this.value)}`;
            }
        });
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initProfile() {
    document.getElementById('profile-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Profile functionality coming soon!');
    });
}

function initAnimations() {
    if (!document.querySelector('.hero')) return;

    // Sidebar animations
    gsap.from('.sidebar-section', {
        duration: 0.6,
        x: -50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out'
    });
    
}

// Auto-initialize cart display 
if (document.querySelector('.cart-items')) {
    window.RemboShoppers.loadCart();
    window.RemboShoppers.updateCartCount();
}

function initAnimations() {
    // Hero text animation
    animateHeroText();

function animateHeroText() {
    const texts = [
        'WELCOME SHOPPERS!!!',
        'KARIBUNI WAREMBO',
        'SHOP MORE SAVE MORE',
        'LETS GO SHOPPING'
    ];
    
    let currentIndex = 0;
    const heroText = document.querySelector('.changing-text');

    function changeText() {
        gsap.to(heroText, {
            duration: 0.8,
            scale: 1.1,
            y: -10,
            ease: 'power2.out',
            onComplete: () => {
                heroText.textContent = texts[currentIndex];
                gsap.to(heroText, {
                    duration: 0.6,
                    scale: 1,
                    y: 0,
                    ease: 'elastic.out(1, 0.3)'
                });
            }
        });
        currentIndex = (currentIndex + 1) % texts.length;
    }
    
    setInterval(changeText, 4000);
    changeText(); 
}
}

function initProductCards() {
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1.05,
                rotateY: 5,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1,
                rotateY: 0,
                ease: 'power2.out'
            });
        });
    });
}

 
// NEWSLETTER
function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            
             
            showNewsletterSuccess();
            this.reset();
        });
    }
}

function showNewsletterSuccess() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = '🎉 Thank you for subscribing!';
    document.querySelector('.footer-newsletter').appendChild(message);
    
    gsap.fromTo(message, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    
    setTimeout(() => {
        gsap.to(message, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            onComplete: () => message.remove()
        });
    }, 3000);
}

// PROFILE/LOGIN
function initProfile() {
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
}

function showLoginModal() {
    const isLoggedIn = localStorage.getItem('remboUser');
    if (isLoggedIn) {
        alert('Welcome back! 👋');
    } else {
        const email = prompt('Enter your email to login:');
        if (email) {
            localStorage.setItem('remboUser', email);
            document.getElementById('profile-link').innerHTML = 
                `<i class="fas fa-user-circle"></i><span>${email.split('@')[0]}</span>`;
        }
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            gsap.fromTo(entry.target, 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
            );
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Reinitialize responsive elements
        initMobileMenu();
    }, 250);
});
 
// PERFORMANCE OPTIMIZATIONS
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

 
let ticking = false;
function updateScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            // Handle scroll-based animations here
            ticking = false;
        });
        ticking = true;
    }
}
window.addEventListener('scroll', debounce(updateScroll, 16));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
 

function initUltraSmoothScroll() {
     
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const targetPos = target.offsetTop - 100;
                smoothScrollTo(targetPos, 1000);
            }
        });
    });
     
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const header = document.querySelector('header');
                const scrolled = window.scrollY > 50;
                header.classList.toggle('scrolled', scrolled);
                ticking = false;
            });
            ticking = true;
        }
    });
}
function smoothScrollTo(targetPos, duration) {
    const startPos = window.pageYOffset;
    const distance = targetPos - startPos;
    let startTime = null;
    
    function animation(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startPos + distance * ease);
        if (progress < 1) requestAnimationFrame(animation);
    }
    
    requestAnimationFrame(animation);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
 

function initPremiumResponsiveness() {
    updateViewport();
    window.addEventListener('resize', debounce(updateViewport, 250));
    window.addEventListener('orientationchange', debounce(updateViewport, 250));
    
    // Smart mobile menu
    initSmartMobileMenu();
    
    document.addEventListener('touchstart', handleTouch, { passive: false });
}

function updateViewport() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

function initSmartMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    
    function toggleMobileMenu() {
        navLinks.classList.toggle('mobile-open');
        document.querySelector('.hamburger-menu')?.classList.toggle('active');
        document.querySelector('.mobile-overlay')?.classList.toggle('active');
    }
    
    if (window.innerWidth <= 1024 && !document.querySelector('.hamburger-menu')) {
        createHamburgerMenu(toggleMobileMenu);
    }
    
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 1024) {
            navLinks.classList.remove('mobile-open');
            document.querySelector('.hamburger-menu')?.classList.remove('active');
            document.querySelector('.mobile-overlay')?.classList.remove('active');
        }
    }, 300));
}

function createHamburgerMenu(toggleFn) {
    const nav = document.querySelector('nav');
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger-menu';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.onclick = e => {
        e.stopPropagation();
        toggleFn();
    };
    nav.appendChild(hamburger);
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.onclick = toggleFn;
    document.body.appendChild(overlay);
}

function handleTouch(e) {
    if (e.touches.length > 1) e.preventDefault();
}
// HOMEPAGE FEATURES
function initHomepage() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            RemboShoppers.addToCart(
                this.dataset.product, 
                this.dataset.price, 
                this
            );
        });
    });
    
    //animations
    initHeroAnimation();
    initProductAnimations();
}

function showAddToCartAnimation(button) {
    const rect = button.getBoundingClientRect();
    const cartIcon = document.querySelector('.cart i');
    
    if (!cartIcon) return;
    
    const flyout = document.createElement('div');
    flyout.className = 'cart-flyout';
    flyout.innerHTML = '🛒';
    Object.assign(flyout.style, {
        position: 'fixed',
        left: `${rect.left + window.scrollX}px`,
        top: `${rect.top + window.scrollY}px`,
        zIndex: 9999,
        fontSize: '24px',
        pointerEvents: 'none'
    });
    
    document.body.appendChild(flyout);
    
    const cartRect = cartIcon.getBoundingClientRect();
    gsap.to(flyout, {
        left: cartRect.left + window.scrollX + 'px',
        top: cartRect.top + window.scrollY + 'px',
        scale: 0.3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => flyout.remove()
    });
    
    // Success confetti
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
}

function initHeroAnimation() {
    const heroText = document.querySelector('.changing-text');
    if (!heroText) return;
    
    const texts = ['WELCOME SHOPPERS!!!', 'KARIBUNI WAREMBO', 'SAVE BIG TODAY'];
    let index = 0;
    
    function animateText() {
        gsap.to(heroText, {
            scale: 1.1,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                heroText.textContent = texts[index];
                index = (index + 1) % texts.length;
            }
        });
    }
    
    setInterval(animateText, 3500);
    animateText();
}
 
    // Hover effects
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => 
            gsap.to(card, { scale: 1.05, rotateY: 5, duration: 0.3 })
        );
        card.addEventListener('mouseleave', () => 
            gsap.to(card, { scale: 1, rotateY: 0, duration: 0.3 })
        );
    });

    // UTILITIES
 function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${message}`;
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-weight: 500;
    `;
    
    document.body.appendChild(notif);
    gsap.fromTo(notif, { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });
    
    setTimeout(() => {
        gsap.to(notif, { x: 300, opacity: 0, duration: 0.4, onComplete: () => notif.remove() });
    }, 3000);
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}
function initMicroInteractions() {
    // Button hovers
    document.querySelectorAll('.btn, .add-to-cart').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.05, duration: 0.2 }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.2 }));
    });
}
 