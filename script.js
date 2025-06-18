document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const addPostBtn = document.querySelector('.add-post-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordField = document.getElementById('password-field');
    const submitPassword = document.getElementById('submit-password');
    const addPostModal = document.getElementById('add-post-modal');
    const postModal = document.getElementById('post-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const latestUploads = document.getElementById('latest-uploads');
    const allPosts = document.getElementById('all-posts');
    const loadMoreBtn = document.getElementById('load-more');
    const searchInput = document.getElementById('search-input');
    const uploadPostBtn = document.getElementById('upload-post');
    const uploadHistory = document.querySelector('.history-container');
    const addPostForm = document.getElementById('add-post-form');
    
    // Sample data (in a real app, this would come from a database)
    let posts = [
        {
            id: '1',
            title: 'Responsive Navbar with CSS Grid',
            thumbnail: 'https://via.placeholder.com/600x400/252525/3498db?text=Navbar',
            description: 'Learn how to create a responsive navbar using CSS Grid. This example shows how to make a navbar that works on all devices.<code><nav>\n  <div class="logo">Logo</div>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Contact</a>\n  </div>\n</nav></code>',
            demoLink: 'https://example.com/demo1',
            date: '2023-06-15'
        },
        {
            id: '2',
            title: 'Animated Button Hover Effects',
            thumbnail: 'https://via.placeholder.com/600x400/252525/3498db?text=Button',
            description: 'Create beautiful button hover effects with CSS animations. This tutorial covers 5 different effects you can use in your projects.<code>.btn {\n  padding: 12px 24px;\n  background: #3498db;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n.btn:hover {\n  transform: translateY(-3px);\n  box-shadow: 0 10px 20px rgba(0,0,0,0.1);\n}</code>',
            demoLink: 'https://example.com/demo2',
            date: '2023-06-10'
        },
        {
            id: '3',
            title: 'Dark/Light Mode Toggle',
            thumbnail: 'https://via.placeholder.com/600x400/252525/3498db?text=Toggle',
            description: 'Implement a dark/light mode toggle for your website using CSS variables and JavaScript.<code>// CSS\n:root {\n  --bg-color: #ffffff;\n  --text-color: #333333;\n}\n\n[data-theme="dark"] {\n  --bg-color: #1a1a1a;\n  --text-color: #ffffff;\n}\n\nbody {\n  background-color: var(--bg-color);\n  color: var(--text-color);\n}</code>',
            demoLink: 'https://example.com/demo3',
            date: '2023-06-05'
        },
        {
            id: '4',
            title: 'Custom Scrollbar Design',
            thumbnail: 'https://via.placeholder.com/600x400/252525/3498db?text=Scrollbar',
            description: 'How to customize your website scrollbar with CSS for a more polished look.<code>/* Works on Firefox */\n* {\n  scrollbar-width: thin;\n  scrollbar-color: #3498db #252525;\n}\n\n/* Works on Chrome, Edge, and Safari */\n*::-webkit-scrollbar {\n  width: 8px;\n}\n\n*::-webkit-scrollbar-track {\n  background: #252525;\n}\n\n*::-webkit-scrollbar-thumb {\n  background-color: #3498db;\n  border-radius: 20px;\n}</code>',
            demoLink: 'https://example.com/demo4',
            date: '2023-05-28'
        },
        {
            id: '5',
            title: 'CSS Only Loading Spinner',
            thumbnail: 'https://via.placeholder.com/600x400/252525/3498db?text=Spinner',
            description: 'Create a loading spinner using only CSS, no JavaScript required.<code>.spinner {\n  width: 40px;\n  height: 40px;\n  border: 4px solid rgba(0, 0, 0, 0.1);\n  border-radius: 50%;\n  border-left-color: #3498db;\n  animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}</code>',
            demoLink: 'https://example.com/demo5',
            date: '2023-05-20'
        }
    ];
    
    let displayedPosts = 5;
    const postsPerLoad = 5;
    let filteredPosts = [...posts];
    let currentPostId = null;
    
    // Check if password is saved in localStorage
    if (localStorage.getItem('postPassword')) {
        addPostBtn.addEventListener('click', function() {
            addPostModal.style.display = 'block';
            loadUploadHistory();
        });
    } else {
        addPostBtn.addEventListener('click', function() {
            passwordModal.style.display = 'block';
        });
    }
    
    // Burger button click event
    burgerBtn.addEventListener('click', function() {
        mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Close modals when clicking on X button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Submit password
    submitPassword.addEventListener('click', function() {
        const password = passwordField.value.trim();
        // In a real app, you would verify the password with a server
        if (password) {
            localStorage.setItem('postPassword', password);
            passwordModal.style.display = 'none';
            addPostModal.style.display = 'block';
            loadUploadHistory();
        }
    });
    
    // Load more posts
    loadMoreBtn.addEventListener('click', function() {
        displayedPosts += postsPerLoad;
        renderPosts();
        if (displayedPosts >= filteredPosts.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.description.toLowerCase().includes(searchTerm)
        );
        displayedPosts = postsPerLoad;
        renderPosts();
        loadMoreBtn.style.display = filteredPosts.length > displayedPosts ? 'block' : 'none';
    });
    
    // Upload new post
    uploadPostBtn.addEventListener('click', function() {
        const thumbnailUrl = document.getElementById('thumbnail-url').value.trim();
        const title = document.getElementById('post-title').value.trim();
        const description = document.getElementById('post-description').value.trim();
        const demoLink = document.getElementById('demo-link').value.trim();
        
        if (!thumbnailUrl || !title || !description || !demoLink) {
            alert('Please fill all fields');
            return;
        }
        
        const newPost = {
            id: Date.now().toString(),
            title,
            thumbnail: thumbnailUrl,
            description,
            demoLink,
            date: new Date().toISOString().split('T')[0]
        };
        
        posts.unshift(newPost);
        filteredPosts.unshift(newPost);
        
        // Clear form
        document.getElementById('thumbnail-url').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-description').value = '';
        document.getElementById('demo-link').value = '';
        
        // Update UI
        renderPosts();
        loadUploadHistory();
        addPostModal.style.display = 'none';
    });
    
    // Render posts to the UI
    function renderPosts() {
        // Clear existing posts
        latestUploads.querySelector('.scroll-container').innerHTML = '';
        allPosts.innerHTML = '';
        
        // Render latest uploads (first 3 posts)
        const latest = filteredPosts.slice(0, 3);
        latest.forEach(post => {
            latestUploads.querySelector('.scroll-container').appendChild(createPostCard(post));
        });
        
        // Render all posts (up to displayedPosts count)
        const visiblePosts = filteredPosts.slice(0, displayedPosts);
        visiblePosts.forEach(post => {
            allPosts.appendChild(createPostCard(post));
        });
        
        // Show/hide load more button
        loadMoreBtn.style.display = filteredPosts.length > displayedPosts ? 'block' : 'none';
        
        // Add click events to post cards
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                openPostModal(postId);
            });
        });
    }
    
    // Create post card element
    function createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-id', post.id);
        
        card.innerHTML = `
            <div class="post-thumbnail">
                <img src="${post.thumbnail}" alt="${post.title}">
            </div>
            <div class="post-info">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-date">Uploaded at ${formatDate(post.date)}</p>
            </div>
        `;
        
        return card;
    }
    
    // Open post modal
    function openPostModal(postId) {
        currentPostId = postId;
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        // Update URL
        history.pushState(null, null, `?id=${postId}`);
        
        // Set modal content
        document.getElementById('modal-title').textContent = post.title;
        document.getElementById('modal-date').textContent = formatDate(post.date);
        document.getElementById('modal-thumbnail').src = post.thumbnail;
        document.getElementById('modal-thumbnail').alt = post.title;
        document.getElementById('demo-btn').href = post.demoLink;
        
        // Process description with code and link tags
        let description = post.description;
        
        // Replace <code> tags with proper formatting
        description = description.replace(/<code>([\s\S]*?)<\/code>/g, function(match, code) {
            return `<div class="code-box">
                <div class="code-header">
                    <span>Code</span>
                    <button class="copy-btn" onclick="copyCode(this)"><i class="far fa-copy"></i> Copy</button>
                </div>
                <textarea class="code-content" style="display: none;">${escapeHtml(code)}</textarea>
            </div>`;
        });
        
        // Replace <link> tags with proper links
        description = description.replace(/<link>\[([^\]]+)\]\(([^)]+)\)<\/link>/g, '<a href="$2" target="_blank">$1</a>');
        
        // Set description
        document.getElementById('modal-description').innerHTML = description;
        
        // Initialize CodeMirror for code boxes
        document.querySelectorAll('.code-box').forEach(box => {
            const textarea = box.querySelector('.code-content');
            const code = textarea.value;
            
            // Remove the textarea
            box.removeChild(textarea);
            
            // Create a new div for CodeMirror
            const editorDiv = document.createElement('div');
            box.appendChild(editorDiv);
            
            // Initialize CodeMirror
            const editor = CodeMirror(editorDiv, {
                value: code,
                mode: 'htmlmixed',
                theme: 'dracula',
                lineNumbers: true,
                readOnly: true,
                lineWrapping: true
            });
            
            // Set height based on content
            const lineCount = editor.lineCount();
            editor.setSize(null, lineCount * 20 + 20); // 20px per line + padding
        });
        
        // Show modal
        postModal.style.display = 'block';
    }
    
    // Load upload history
    function loadUploadHistory() {
        uploadHistory.innerHTML = '';
        
        // Filter posts that would be considered "user's posts" (in a real app, this would filter by user)
        const userPosts = posts.slice(0, 3); // Just for demo, showing first 3 posts
        
        userPosts.forEach(post => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-id', post.id);
            
            historyItem.innerHTML = `
                <div class="history-thumbnail">
                    <img src="${post.thumbnail}" alt="${post.title}">
                </div>
                <div class="history-actions">
                    <button class="edit-post"><i class="fas fa-edit"></i></button>
                    <button class="delete-post"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            uploadHistory.appendChild(historyItem);
            
            // Add edit event
            historyItem.querySelector('.edit-post').addEventListener('click', function(e) {
                e.stopPropagation();
                editPost(post.id);
            });
            
            // Add delete event
            historyItem.querySelector('.delete-post').addEventListener('click', function(e) {
                e.stopPropagation();
                deletePost(post.id);
            });
            
            // Add click event to open post
            historyItem.addEventListener('click', function() {
                openPostModal(post.id);
            });
        });
        
        // Show the form to add new posts
        addPostForm.style.display = 'flex';
    }
    
    // Edit post
    function editPost(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        // Fill the form with post data
        document.getElementById('thumbnail-url').value = post.thumbnail;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-description').value = post.description;
        document.getElementById('demo-link').value = post.demoLink;
        
        // Change the upload button to update
        uploadPostBtn.textContent = 'Update Post';
        uploadPostBtn.removeEventListener('click', uploadPostHandler);
        
        function updatePostHandler() {
            const thumbnailUrl = document.getElementById('thumbnail-url').value.trim();
            const title = document.getElementById('post-title').value.trim();
            const description = document.getElementById('post-description').value.trim();
            const demoLink = document.getElementById('demo-link').value.trim();
            
            if (!thumbnailUrl || !title || !description || !demoLink) {
                alert('Please fill all fields');
                return;
            }
            
            // Update post
            post.thumbnail = thumbnailUrl;
            post.title = title;
            post.description = description;
            post.demoLink = demoLink;
            
            // Reset form
            document.getElementById('thumbnail-url').value = '';
            document.getElementById('post-title').value = '';
            document.getElementById('post-description').value = '';
            document.getElementById('demo-link').value = '';
            
            // Reset button
            uploadPostBtn.textContent = 'Upload Sekarang';
            uploadPostBtn.addEventListener('click', uploadPostHandler);
            
            // Update UI
            renderPosts();
            loadUploadHistory();
        }
        
        uploadPostBtn.addEventListener('click', updatePostHandler);
    }
    
    // Delete post
    function deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            posts = posts.filter(p => p.id !== postId);
            filteredPosts = filteredPosts.filter(p => p.id !== postId);
            
            // Update UI
            renderPosts();
            loadUploadHistory();
            
            // If we're viewing the deleted post, close the modal
            if (currentPostId === postId) {
                postModal.style.display = 'none';
                history.pushState(null, null, window.location.pathname);
            }
        }
    }
    
    // Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Escape HTML for code display
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Check URL for post ID on page load
    function checkUrlForPost() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
            openPostModal(postId);
        }
    }
    
    // Copy code to clipboard
    window.copyCode = function(button) {
        const codeBox = button.closest('.code-box');
        const editor = codeBox.querySelector('.CodeMirror');
        const code = editor.CodeMirror.getValue();
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        });
    };
    
    // Initial render
    renderPosts();
    checkUrlForPost();
    
    // Regular upload handler
    function uploadPostHandler() {
        const thumbnailUrl = document.getElementById('thumbnail-url').value.trim();
        const title = document.getElementById('post-title').value.trim();
        const description = document.getElementById('post-description').value.trim();
        const demoLink = document.getElementById('demo-link').value.trim();
        
        if (!thumbnailUrl || !title || !description || !demoLink) {
            alert('Please fill all fields');
            return;
        }
        
        const newPost = {
            id: Date.now().toString(),
            title,
            thumbnail: thumbnailUrl,
            description,
            demoLink,
            date: new Date().toISOString().split('T')[0]
        };
        
        posts.unshift(newPost);
        filteredPosts.unshift(newPost);
        
        // Clear form
        document.getElementById('thumbnail-url').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-description').value = '';
        document.getElementById('demo-link').value = '';
        
        // Update UI
        renderPosts();
        loadUploadHistory();
        addPostModal.style.display = 'none';
    }
    
    uploadPostBtn.addEventListener('click', uploadPostHandler);
});
