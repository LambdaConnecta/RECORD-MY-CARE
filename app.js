// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAS8R4wpC0-Cja9-BnRKEiSEhTr37ODWFU",
    authDomain: "carebook-a5aa0.firebaseapp.com",
    projectId: "carebook-a5aa0",
    storageBucket: "carebook-a5aa0.firebasestorage.app",
    messagingSenderId: "880891727304",
    appId: "1:880891727304:web:eafe086ab12f6e17f144fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const loginPage = document.getElementById('loginPage');
const signUpPage = document.getElementById('signUpPage');
const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const signUpForm = document.getElementById('signUpForm');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const logoutBtn = document.getElementById('logoutBtn');
const signUpLink = document.getElementById('signUpLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Toast Notification Function
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    toast.innerHTML = `
        <span style="font-size: 20px;">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show/Hide Pages
function showPage(page) {
    loginPage.style.display = 'none';
    signUpPage.style.display = 'none';
    loadingScreen.style.display = 'none';
    appContainer.style.display = 'none';
    
    if (page === 'login') {
        loginPage.style.display = 'flex';
    } else if (page === 'signup') {
        signUpPage.style.display = 'flex';
    } else if (page === 'loading') {
        loadingScreen.style.display = 'flex';
    } else if (page === 'app') {
        appContainer.style.display = 'flex';
        updateUI();
        loadDashboard();
    }
}

// Email/Password Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showPage('loading');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Successfully signed in!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showPage('login');
        
        let errorMessage = 'Failed to sign in. Please try again.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        }
        
        showToast(errorMessage, 'error');
    }
});

// Email/Password Sign Up
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    showPage('loading');
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });
        
        showToast('Account created successfully!', 'success');
    } catch (error) {
        console.error('Sign up error:', error);
        showPage('signup');
        
        let errorMessage = 'Failed to create account. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Use at least 6 characters.';
        }
        
        showToast(errorMessage, 'error');
    }
});

// Google Sign In
googleSignInBtn.addEventListener('click', async () => {
    showPage('loading');
    
    try {
        await signInWithPopup(auth, googleProvider);
        showToast('Successfully signed in with Google!', 'success');
    } catch (error) {
        console.error('Google sign in error:', error);
        showPage('login');
        
        let errorMessage = 'Failed to sign in with Google.';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup blocked. Please allow popups for this site.';
        }
        
        showToast(errorMessage, 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showToast('Logged out successfully', 'success');
        showPage('login');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Failed to logout', 'error');
    }
});

// Password Reset
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        showToast('Please enter your email address first', 'error');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset email.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        
        showToast(errorMessage, 'error');
    }
});

// Page Navigation
signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signup');
});

backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('login');
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
        showPage('app');
    } else {
        console.log('User is signed out');
        showPage('login');
    }
});

// Update UI with User Info
function updateUI() {
    const user = auth.currentUser;
    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        const initials = displayName.substring(0, 1).toUpperCase();
        
        document.getElementById('userName').textContent = displayName;
        document.getElementById('userAvatar').textContent = initials;
        
        // Update greeting
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        
        document.getElementById('greeting').textContent = `${greeting}, ${displayName.toUpperCase()}`;
        
        // Update date
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-GB', options);
    }
}

// Navigation Handler
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        const page = this.dataset.page;
        loadPage(page);
    });
});

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const isMenuClick = menuToggle.contains(e.target);
    const isSidebarClick = sidebar.contains(e.target);
    
    if (!isMenuClick && !isSidebarClick && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Close sidebar when navigation item is clicked on mobile
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
});

// Add responsive helper
function makeResponsive() {
    // Force single column on mobile for all grid layouts
    if (window.innerWidth <= 480) {
        document.querySelectorAll('[style*="display: grid"]').forEach(el => {
            el.style.gridTemplateColumns = '1fr';
        });
    }
}

// Run on page load and resize
window.addEventListener('resize', makeResponsive);
window.addEventListener('load', makeResponsive);

// Page Loader
function loadPage(page) {
    const pageContent = document.getElementById('pageContent');
    
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'my-tasks':
            loadMyTasks();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'service-users':
            loadServiceUsers();
            break;
        case 'rota':
            loadRota();
            break;
        case 'visits':
            loadVisits();
            break;
        case 'medications':
            loadMedications();
            break;
        case 'mar-chart':
            loadMARChart();
            break;
        case 'care-plans':
            loadCarePlans();
            break;
        case 'daily-logs':
            loadDailyLogs();
            break;
        case 'reports':
            loadReports();
            break;
        case 'audit-log':
            loadAuditLog();
            break;
        default:
            loadDashboard();
    }
}

// Dashboard Page
function loadDashboard() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 24px; margin-bottom: 32px;">
            <div class="stat-card" style="background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Active Staff</span>
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 20px;">👥</div>
                </div>
                <div style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">4</div>
                <div style="font-size: 13px; color: var(--text-secondary);">4 total</div>
            </div>

            <div class="stat-card" style="background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Service Users</span>
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #fce7f3; color: #db2777; display: flex; align-items: center; justify-content: center; font-size: 20px;">♥</div>
                </div>
                <div style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">3</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Receiving care</div>
            </div>

            <div class="stat-card" style="background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Today's Shifts</span>
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--info-bg); color: var(--info); display: flex; align-items: center; justify-content: center; font-size: 20px;">📅</div>
                </div>
                <div style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">3</div>
                <div style="font-size: 13px; color: var(--text-secondary);">0 completed</div>
            </div>

            <div class="stat-card" style="background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Visits Today</span>
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #d4f8e8; color: #0d9f6e; display: flex; align-items: center; justify-content: center; font-size: 20px;">🏠</div>
                </div>
                <div style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">0</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Logged visits</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr)); gap: 24px; margin-bottom: 32px;">
            <div style="background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--warning-bg); display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">⚠️</span>
                    <span style="font-size: 16px; font-weight: 600; flex: 1;">DBS Expiring Soon</span>
                    <span style="background: rgba(0,0,0,0.1); padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">1</span>
                </div>
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Emily Roberts</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Expires: 20 Feb 2026</div>
                    </div>
                    <span style="color: var(--text-secondary); font-size: 18px;">›</span>
                </div>
            </div>

            <div style="background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;">
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--info-bg); display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">📄</span>
                    <span style="font-size: 16px; font-weight: 600; flex: 1;">Pending Review</span>
                    <span style="background: rgba(0,0,0,0.1); padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">2</span>
                </div>
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); cursor: pointer;">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Daily Handover - 3rd February 2026</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">Handover • 3 Feb</div>
                </div>
                <div style="padding: 20px 24px; cursor: pointer;">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Compliment from Family - Wilson</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">Compliment • 3 Feb</div>
                </div>
            </div>
        </div>

        <div style="background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;">
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--danger-bg); display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">💊</span>
                <span style="font-size: 16px; font-weight: 600; flex: 1;">Medication Alerts</span>
                <span style="background: rgba(0,0,0,0.1); padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">2</span>
            </div>
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border); cursor: pointer;">
                <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Paracetamol</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Margaret Wilson • No scheduled times</div>
            </div>
            <div style="padding: 20px 24px; cursor: pointer;">
                <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Furosemide</div>
                <div style="font-size: 13px; color: var(--text-secondary);">George Taylor • Low stock: 8</div>
            </div>
        </div>
    `;
    makeResponsive();
}

// My Tasks Page
function loadMyTasks() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px;">
            <div>
                <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 8px;">My Tasks</h1>
                <p style="color: var(--text-secondary);">0 tasks assigned to you</p>
            </div>
            <button class="btn btn-primary">+ New Task</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 20px; margin-bottom: 32px;">
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px; color: var(--danger);">⚠</span>
                    <div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Overdue</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--danger);">0</div>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px; color: var(--warning);">⏰</span>
                    <div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Due Today</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--warning);">0</div>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px; color: var(--warning);">!</span>
                    <div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Urgent</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--warning);">0</div>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px; color: var(--info);">⏳</span>
                    <div>
                        <div style="font-size: 14px; color: var(--text-secondary);">In Progress</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--info);">0</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="background: white; border-radius: 16px; padding: 24px; text-align: center; color: var(--text-secondary);">
            <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
            <p style="font-size: 16px;">No pending tasks</p>
        </div>
    `;
    makeResponsive();
}

// Staff Page
function loadStaff() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px;">
            <div>
                <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 8px;">Staff</h1>
                <p style="color: var(--text-secondary);">4 team members</p>
            </div>
            <button class="btn btn-primary">+ Add Staff</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 20px;">
            ${generateStaffCards()}
        </div>
    `;
    makeResponsive();
}

function generateStaffCards() {
    const staff = [
        { name: 'Sarah Mitchell', role: 'Senior Care Assistant', email: 'sarah.mitchell@carehub.com', phone: '07700 900123', status: 'Active', dbs: 'DBS expired' },
        { name: 'James Thompson', role: 'Care Assistant', email: 'james.thompson@carehub.com', phone: '07700 900456', status: 'Active', dbs: 'DBS valid' },
        { name: 'Emily Roberts', role: 'Care Assistant', email: 'emily.roberts@carehub.com', phone: '07700 900789', status: 'Active', dbs: 'DBS expiring soon' },
        { name: 'Michael Brown', role: 'Night Care Assistant', email: 'michael.brown@carehub.com', phone: '07700 900321', status: 'Active', dbs: 'DBS valid' }
    ];

    return staff.map(s => `
        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">
                    ${s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">${s.name}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${s.role}</div>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span>✉️</span>
                    <span>${s.email}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                    <span>📞</span>
                    <span>${s.phone}</span>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #d4f8e8; color: #0d9f6e;">${s.status}</span>
                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${s.dbs.includes('valid') ? '#d4f8e8' : s.dbs.includes('soon') ? var('--warning-bg') : var('--danger-bg')}; color: ${s.dbs.includes('valid') ? '#0d9f6e' : s.dbs.includes('soon') ? '#d97706' : var('--danger')};">
                    ${s.dbs.includes('valid') ? '✓' : '⚠'} ${s.dbs}
                </span>
            </div>
        </div>
    `).join('');
}

// Service Users Page
function loadServiceUsers() {
    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px;">
            <div>
                <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 8px;">Service Users</h1>
                <p style="color: var(--text-secondary);">3 receiving care</p>
            </div>
            <button class="btn btn-primary">+ Add Service User</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 20px;">
            ${generateServiceUserCards()}
        </div>
    `;
    makeResponsive();
}

function generateServiceUserCards() {
    const users = [
        { name: 'Margaret Wilson', age: 83, location: 'Manchester, M1 4BT', phone: '0161 234 5678', tags: ['Assisted', 'Allergies'], status: 'Active', risk: true },
        { name: 'George Taylor', age: 87, location: 'Manchester, M2 5CD', phone: '0161 345 6789', tags: ['Wheelchair', 'Allergies'], status: 'Active', risk: true },
        { name: 'Dorothy Evans', age: 80, location: 'Salford, M6 7EF', phone: '0161 456 7890', tags: ['Assisted'], status: 'Active', risk: false }
    ];

    return users.map(u => `
        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: #fce7f3; color: #db2777; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">
                    ${u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">${u.name}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${u.age} years old</div>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span>📍</span>
                    <span>${u.location}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                    <span>📞</span>
                    <span>${u.phone}</span>
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                ${u.tags.map(tag => `
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: var(--warning-bg); color: #d97706;">${tag}</span>
                `).join('')}
            </div>
            <div style="display: flex; gap: 8px;">
                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #d4f8e8; color: #0d9f6e;">${u.status}</span>
                ${u.risk ? '<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: var(--danger-bg); color: var(--danger);">⚠ Risk Notes</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Placeholder functions for other pages
function loadRota() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Rota</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
            <p style="color: var(--text-secondary);">Rota management coming soon</p>
        </div>
    `;
}

function loadVisits() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Visits</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
            <p style="color: var(--text-secondary);">Visit logging coming soon</p>
        </div>
    `;
}

function loadMedications() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Medications</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">💊</div>
            <p style="color: var(--text-secondary);">Medication management coming soon</p>
        </div>
    `;
}

function loadMARChart() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">MAR Chart</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <p style="color: var(--text-secondary);">MAR Chart coming soon</p>
        </div>
    `;
}

function loadCarePlans() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Care Plans</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <p style="color: var(--text-secondary);">Care plans coming soon</p>
        </div>
    `;
}

function loadDailyLogs() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Daily Care Logs</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
            <p style="color: var(--text-secondary);">Daily logs coming soon</p>
        </div>
    `;
}

function loadReports() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Reports</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
            <p style="color: var(--text-secondary);">Reports coming soon</p>
        </div>
    `;
}

function loadAuditLog() {
    document.getElementById('pageContent').innerHTML = `
        <h1 style="font-size: clamp(24px, 5vw, 32px); font-weight: 700; margin-bottom: 24px;">Audit Log</h1>
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">👁</div>
            <p style="color: var(--text-secondary);">Audit log coming soon</p>
        </div>
    `;
}

// Initialize
console.log('CareBook App Initialized');
showPage('loading');
