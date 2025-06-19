// Database instance
const db = new PostDB();

// DOM Elements
const burgerBtn = document.querySelector('.burger-btn');
const navLinks = document.querySelector('.nav-links');
const addPostBtn = document.querySelector('.add-post-btn');
const newUploadsContainer = document.getElementById('new-uploads');
const allPostsContainer = document.getElementById('all-posts');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search-input');
const postModal = document.getElementById('post-modal');
const addPostModal = document.getElementById('add-post-modal');
const passwordSection = document.getElementById('password-section');
const addPostSection = document.getElementById('add-post-section');
const postForm = document.getElementById('post-form');
const showPostFormBtn = document.getElementById('show-post-form');
const uploadPostBtn = document.getElementById('upload-post');
const historyPostsContainer = document.getElementById('history-posts');
const submitPasswordBtn = document.getElementById('submit-password');
const postPasswordInput = document.getElementById('post-password');

// Variables
let visiblePosts = 6;
const postsPerLoad = 6;
const CORRECT_PASSWORD = 'posting123';
let posts = [];

// Default profile picture
const DEFAULT_PROFILE_PIC = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

// Sample thumbnail images
const SAMPLE_THUMBNAILS = [
    'https://i.ibb.co/Y7DRHxMF/code-sample1.jpg',
    'https://i.ibb.co/0jQ4YyP/code-sample2.jpg',
    'https://i.ibb.co/5KqJz0B/code-sample3.jpg'
];

// Initialize the app
async function init() {
    try {
        // Load posts from IndexedDB
        posts = await db.getAllPosts();
        
        // If no posts, add sample data
        if (posts.length === 0) {
            await addSamplePosts();
            posts = await db.getAllPosts();
        }
        
        renderNewUploads();
        renderAllPosts();
        setupEventListeners();
        checkSavedPassword();
        checkUrlForPostId();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Add sample posts to database
async function addSamplePosts() {
    const samplePosts = [
        {
            id: '1',
            title: 'Responsive Navbar with Burger Menu',
            description: 'Learn how to create a responsive navbar with burger menu for mobile devices. Perfect for modern websites! <code>const burger = document.querySelector(".burger");</code> <link>[View more tutorials](https://example.com)</link>',
            image: SAMPLE_THUMBNAILS[0],
            date: '2023-05-15',
            htmlCode: '<nav class="navbar">\n  <div class="logo">Logo</div>\n  <div class="burger">☰</div>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n  </div>\n</nav>',
            cssCode: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  padding: 1rem;\n}\n\n.burger {\n  display: none;\n}\n\n@media (max-width: 768px) {\n  .burger {\n    display: block;\n  }\n}',
            jsCode: 'const burger = document.querySelector(".burger");\nconst navLinks = document.querySelector(".nav-links");\n\nburger.addEventListener("click", () => {\n  navLinks.classList.toggle("active");\n});',
            demoLink: 'https://example.com/demo1'
        },
        {
            id: '2',
            title: 'CSS Grid Layout Tutorial',
            description: 'Master CSS Grid with this comprehensive tutorial. Create complex layouts easily with CSS Grid! <code>.container { display: grid; }</code>',
            image: SAMPLE_THUMBNAILS[1],
            date: '2023-05-10',
            htmlCode: '<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
            cssCode: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\n.item {\n  background: #eee;\n  padding: 1rem;\n}',
            jsCode: '// No JavaScript required for basic grid',
            demoLink: 'https://example.com/demo2'
        },
        {
            id: '3',
            title: 'JavaScript Fetch API',
            description: 'Learn how to use Fetch API to get data from servers. Modern alternative to XMLHttpRequest. <code>fetch("url").then(res => res.json())</code>',
            image: SAMPLE_THUMBNAILS[2],
            date: '2023-05-05',
            htmlCode: '<button id="fetch-btn">Fetch Data</button>\n<div id="result"></div>',
            cssCode: '#result {\n  margin-top: 1rem;\n  padding: 1rem;\n  border: 1px solid #ddd;\n}',
            jsCode: 'document.getElementById("fetch-btn").addEventListener("click", () => {\n  fetch("https://api.example.com/data")\n    .then(response => response.json())\n    .then(data => {\n      document.getElementById("result").textContent = JSON.stringify(data);\n    });\n});',
            demoLink: 'https://example.com/demo3'
        }
    ];

    for (const post of samplePosts) {
        await db.addPost(post);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Burger button click
    burgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Add post button click
    addPostBtn.addEventListener('click', () => {
        addPostModal.style.display = 'block';
    });

    // Close modal buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            postModal.style.display = 'none';
            addPostModal.style.display = 'none';
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            postModal.style.display = 'none';
        }
        if (e.target === addPostModal) {
            addPostModal.style.display = 'none';
        }
    });

    // Load more button click
    loadMoreBtn.addEventListener('click', () => {
        visiblePosts += postsPerLoad;
        renderAllPosts();
    });

    // Search input event with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderAllPosts();
        }, 300);
    });

    // Show post form with smooth animation
    showPostFormBtn.addEventListener('click', () => {
        postForm.style.opacity = '0';
        postForm.style.display = 'flex';
        postForm.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
            postForm.style.opacity = '1';
        }, 10);
        showPostFormBtn.style.display = 'none';
    });

    // Upload post
    uploadPostBtn.addEventListener('click', uploadPost);

    // Submit password
    submitPasswordBtn.addEventListener('click', checkPassword);
    postPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// Check if password is saved in localStorage
function checkSavedPassword() {
    const savedPassword = localStorage.getItem('postPassword');
    if (savedPassword === CORRECT_PASSWORD) {
        passwordSection.style.display = 'none';
        addPostSection.style.display = 'block';
        renderHistoryPosts();
    }
}

// Check password for add post
function checkPassword() {
    const password = postPasswordInput.value;
    if (password === CORRECT_PASSWORD) {
        localStorage.setItem('postPassword', password);
        passwordSection.style.display = 'none';
        addPostSection.style.display = 'block';
        renderHistoryPosts();
    } else {
        alert('Incorrect password!');
    }
}

// Render new uploads section
function renderNewUploads() {
    newUploadsContainer.innerHTML = '';
    
    // Sort by date (newest first) and take first 3
    const newestPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    
    newestPosts.forEach(post => {
        const postElement = createPostCard(post);
        postElement.style.minWidth = '300px';
        newUploadsContainer.appendChild(postElement);
    });
}

// Render all posts section
function renderAllPosts() {
    allPostsContainer.innerHTML = '';
    
    const searchTerm = searchInput.value.toLowerCase();
    let filteredPosts = posts;
    
    if (searchTerm) {
        filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const postsToShow = filteredPosts.slice(0, visiblePosts);
    
    if (postsToShow.length === 0) {
        allPostsContainer.innerHTML = '<p>No posts found.</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    postsToShow.forEach(post => {
        const postElement = createPostCard(post);
        allPostsContainer.appendChild(postElement);
    });
    
    loadMoreBtn.style.display = filteredPosts.length > visiblePosts ? 'block' : 'none';
}

// Create post card element
function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.dataset.id = post.id;
    
    // Use placeholder if image fails to load
    const imgSrc = post.image || SAMPLE_THUMBNAILS[0];
    const imgHTML = `<img src="${imgSrc}" alt="${post.title}" class="post-thumbnail" onerror="this.src='${SAMPLE_THUMBNAILS[0]}'">`;
    
    postCard.innerHTML = `
        ${imgHTML}
        <div class="post-info">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-date">Uploaded at ${formatDate(post.date)}</p>
        </div>
    `;
    
    postCard.addEventListener('click', () => openPostModal(post));
    return postCard;
}

// Render history posts
async function renderHistoryPosts() {
    historyPostsContainer.innerHTML = '';
    
    try {
        const historyPosts = await db.getAllPosts();
        
        if (historyPosts.length === 0) {
            historyPostsContainer.innerHTML = '<p>No posts uploaded yet.</p>';
            return;
        }
        
        // Sort by date (newest first)
        const sortedPosts = [...historyPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedPosts.forEach(post => {
            const historyPost = document.createElement('div');
            historyPost.className = 'history-post';
            historyPost.dataset.id = post.id;
            
            // Use placeholder if image fails to load
            const imgSrc = post.image || SAMPLE_THUMBNAILS[0];
            const imgHTML = `<img src="${imgSrc}" alt="${post.title}" class="history-thumbnail" onerror="this.src='${SAMPLE_THUMBNAILS[0]}'">`;
            
            historyPost.innerHTML = `
                <div class="history-actions">
                    <button class="edit-post"><i class="fas fa-edit"></i></button>
                    <button class="delete-post"><i class="fas fa-trash"></i></button>
                </div>
                ${imgHTML}
                <div class="history-title">${post.title}</div>
            `;
            
            historyPost.querySelector('.edit-post').addEventListener('click', (e) => {
                e.stopPropagation();
                editPost(post.id);
            });
            
            historyPost.querySelector('.delete-post').addEventListener('click', (e) => {
                e.stopPropagation();
                deletePost(post.id);
            });
            
            historyPostsContainer.appendChild(historyPost);
        });
    } catch (error) {
        console.error('Error loading history posts:', error);
    }
}

// Open post modal
async function openPostModal(post) {
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalThumbnail = document.getElementById('modal-thumbnail');
    const modalDescription = document.getElementById('modal-description');
    const demoBtn = document.getElementById('demo-btn');
    const htmlCode = document.getElementById('html-code');
    const cssCode = document.getElementById('css-code');
    const jsCode = document.getElementById('js-code');
    const profilePic = document.querySelector('.profile-pic');
    
    modalTitle.textContent = post.title;
    modalDate.textContent = `Uploaded at ${formatDate(post.date)}`;
    
    // Set profile picture
    profilePic.src = DEFAULT_PROFILE_PIC;
    
    // Set thumbnail with error handling
    modalThumbnail.src = post.image || SAMPLE_THUMBNAILS[0];
    modalThumbnail.onerror = () => {
        modalThumbnail.src = SAMPLE_THUMBNAILS[0];
    };
    modalThumbnail.alt = post.title;
    
    // Process description with code and link tags
    let description = post.description;
    
    // Replace <code> tags
    description = description.replace(/<code>(.*?)<\/code>/gs, '<span class="code-inline">$1</span>');
    
    // Replace <link> tags
    description = description.replace(/<link>\[(.*?)\]\((.*?)\)<\/link>/gs, '<a href="$2" target="_blank">$1</a>');
    
    modalDescription.innerHTML = description;
    
    // Set code boxes
    htmlCode.textContent = post.htmlCode || 'No HTML code provided';
    cssCode.textContent = post.cssCode || 'No CSS code provided';
    jsCode.textContent = post.jsCode || 'No JavaScript code provided';
    
    // Set demo button
    demoBtn.href = post.demoLink || '#';
    demoBtn.style.display = post.demoLink ? 'inline-flex' : 'none';
    
    // Update URL
    history.pushState(null, null, `?id=${post.id}`);
    
    postModal.style.display = 'block';
}

// Upload new post
async function uploadPost() {
    const imageUrl = document.getElementById('post-image').value;
    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;
    const demoLink = document.getElementById('post-demo').value;
    
    if (!imageUrl || !title || !description) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Extract code from description
    const htmlCodeMatch = description.match(/<code>([\s\S]*?)<\/code>/i);
    const cssCodeMatch = description.match(/<code>([\s\S]*?)<\/code>/gi)?.[1];
    const jsCodeMatch = description.match(/<code>([\s\S]*?)<\/code>/gi)?.[2];
    
    const newPost = {
        id: Date.now().toString(),
        title,
        description,
        image: imageUrl,
        date: new Date().toISOString().split('T')[0],
        htmlCode: htmlCodeMatch ? htmlCodeMatch[1] : '',
        cssCode: cssCodeMatch ? cssCodeMatch.replace(/<code>|<\/code>/g, '') : '',
        jsCode: jsCodeMatch ? jsCodeMatch.replace(/<code>|<\/code>/g, '') : '',
        demoLink
    };
    
    try {
        await db.addPost(newPost);
        posts.unshift(newPost);
        
        document.getElementById('post-form').reset();
        postForm.style.display = 'none';
        showPostFormBtn.style.display = 'flex';
        
        renderNewUploads();
        renderAllPosts();
        renderHistoryPosts();
        
        alert('Post uploaded successfully!');
    } catch (error) {
        console.error('Error uploading post:', error);
        alert('Failed to upload post');
    }
}

// Edit post
async function editPost(postId) {
    try {
        const post = await db.getPost(postId);
        if (!post) return;
        
        // Show form with animation
        postForm.style.opacity = '0';
        postForm.style.display = 'flex';
        postForm.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
            postForm.style.opacity = '1';
        }, 10);
        showPostFormBtn.style.display = 'none';
        
        // Fill form with post data
        document.getElementById('post-image').value = post.image;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-description').value = post.description;
        document.getElementById('post-demo').value = post.demoLink;
        
        // Change upload button text and action
        uploadPostBtn.textContent = 'Update Post';
        
        uploadPostBtn.onclick = async () => {
            const updatedPost = {
                ...post,
                image: document.getElementById('post-image').value,
                title: document.getElementById('post-title').value,
                description: document.getElementById('post-description').value,
                demoLink: document.getElementById('post-demo').value
            };
            
            try {
                await db.updatePost(updatedPost);
                
                // Update local posts array
                const index = posts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    posts[index] = updatedPost;
                }
                
                // Reset form
                document.getElementById('post-form').reset();
                postForm.style.display = 'none';
                showPostFormBtn.style.display = 'flex';
                uploadPostBtn.textContent = 'Upload Sekarang';
                
                // Update UI
                renderNewUploads();
                renderAllPosts();
                renderHistoryPosts();
                
                alert('Post updated successfully!');
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Failed to update post');
            }
        };
    } catch (error) {
        console.error('Error loading post for edit:', error);
        alert('Failed to load post for editing');
    }
}

// Delete post
async function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await db.deletePost(postId);
            posts = posts.filter(post => post.id !== postId);
            renderNewUploads();
            renderAllPosts();
            renderHistoryPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    }
}

// Copy code to clipboard
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = codeElement.parentElement.previousElementSibling.querySelector('.copy-btn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Check URL for post ID on page load
async function checkUrlForPostId() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        try {
            const post = await db.getPost(postId);
            if (post) {
                openPostModal(post);
            }
        } catch (error) {
            console.error('Error loading post from URL:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});
