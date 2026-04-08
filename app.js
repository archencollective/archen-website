document.addEventListener("DOMContentLoaded", () => {
    // Header scroll effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Hero Slideshow
    const heroImages = document.querySelectorAll('.hero-image');
    if (heroImages.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            heroImages[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroImages.length;
            heroImages[currentSlide].classList.add('active');
        }, 4000); // Change image every 4 seconds
    }

    // Simple intersection observer for fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // --- Studio Filtering Logic ---
    const budgetFilter = document.getElementById('budget');
    const typeFilter = document.getElementById('type');
    const emphasisFilter = document.getElementById('emphasis');
    const locationFilter = document.getElementById('location');
    const studioCards = document.querySelectorAll('.studio-card');

    if (budgetFilter && typeFilter && emphasisFilter && locationFilter && studioCards.length > 0) {

        function filterStudios() {
            // Get current filter values
            // Note: Budget and Location are currently not in the text, 
            // but we can filter by the 'Descriptor' text which holds Style / Type.
            const selectedType = typeFilter.value.toLowerCase();
            const selectedEmphasis = emphasisFilter.value.toLowerCase();

            studioCards.forEach(card => {
                const descriptor = card.querySelector('.studio-descriptor').textContent.toLowerCase();
                let isMatch = true;

                // Check Type
                if (selectedType !== 'all') {
                    if (!descriptor.includes(selectedType)) {
                        isMatch = false;
                    }
                }

                // Check Emphasis (Style)
                if (selectedEmphasis !== 'all') {
                    if (!descriptor.includes(selectedEmphasis)) {
                        isMatch = false;
                    }
                }

                // Toggle visibility
                if (isMatch) {
                    card.style.display = 'block';
                    // Re-trigger fade-in if it was hidden
                    setTimeout(() => card.classList.add('visible'), 50);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('visible');
                }
            });
        }

        // Add event listeners to all select dropdowns
        budgetFilter.addEventListener('change', filterStudios);
        typeFilter.addEventListener('change', filterStudios);
        emphasisFilter.addEventListener('change', filterStudios);
        locationFilter.addEventListener('change', filterStudios);
    }

    // --- Inquiry Form Submission ---
    const inquiryForms = document.querySelectorAll('.inquiry-form');
    inquiryForms.forEach(form => {
        // Remove inline onsubmit if it exists
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect Form Data
            const formData = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const label = input.closest('.form-group')?.querySelector('label');
                const name = label ? label.textContent.trim() : input.tagName;
                formData[name] = input.value;
            });

            // Get Studio Name for Context
            const studioNameEl = document.querySelector('.studio-profile-name');
            const studioName = studioNameEl ? studioNameEl.textContent.trim() : 'Unknown Studio';

            // Set button state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit';
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            // Send via Google Apps Script (using URLSearchParams to avoid CORS preflight)
            const urlParams = new URLSearchParams();
            urlParams.append('_subject', `New Inquiry for ${studioName}`);
            urlParams.append('Studio', studioName);
            for (const key in formData) {
                urlParams.append(key, formData[key]);
            }

            fetch("https://script.google.com/macros/s/AKfycbzv-TDxoXniGdk9-F2Wx9XWrnlC9t9nC0cjn9i7HPQ00mSNhvF8CPCpHMsuLDdB6s1v/exec", {
                method: "POST",
                body: urlParams
            })
                .then(response => response.json())
                .then(data => {
                    // Fade out form
                    form.style.transition = 'opacity 0.4s ease-out';
                    form.style.opacity = '0';

                    setTimeout(() => {
                        form.style.display = 'none';

                        // Find or create thank you message
                        let thankYouMsg = form.parentElement.querySelector('.thank-you-message');
                        if (!thankYouMsg) {
                            thankYouMsg = document.createElement('div');
                            thankYouMsg.className = 'thank-you-message fade-in';
                            thankYouMsg.innerHTML = `
                            <h3 style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary-color, #222); font-weight: 300; letter-spacing: 0.05em;">Inquiry Received</h3>
                            <p style="font-size: 1.1rem; color: var(--text-color, #555); line-height: 1.6; max-width: 600px; margin: 0 auto; margin-bottom: 2rem;">Thank you for your interest. Your details have been successfully submitted. Our curation team will carefully review your request with the studio and be in touch promptly.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 2rem; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
                                <h4 style="font-weight: 500; margin-bottom: 1rem; color: #333;">Next Step: Connect on LINE</h4>
                                <p style="font-size: 0.95rem; color: #666; margin-bottom: 1.5rem; line-height: 1.5;">To ensure the fastest communication and easiest sharing of project details, please add our LINE Official Account.</p>
                                <a href="https://line.me/R/ti/p/@766xoahw" target="_blank" style="display: inline-block; background-color: #06C755; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 500; transition: background-color 0.2s;">
                                    Add LINE Official Account
                                </a>
                            </div>
                        `;
                            thankYouMsg.style.textAlign = 'center';
                            thankYouMsg.style.padding = '4rem 1rem';
                            thankYouMsg.style.opacity = '0';
                            thankYouMsg.style.transition = 'opacity 0.5s ease-in';
                            form.parentElement.appendChild(thankYouMsg);
                        }

                        thankYouMsg.style.display = 'block';
                        // Trigger reflow
                        void thankYouMsg.offsetWidth;
                        thankYouMsg.style.opacity = '1';
                        thankYouMsg.classList.add('visible');
                    }, 400);
                })
                .catch(error => {
                    console.error("Form submission error:", error);
                    alert("There was an error sending your inquiry. Please try again later.");
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                });
        });
    });

    // --- Match Modal Logic ---
    const matchBtn = document.getElementById('match-architect-btn');
    const matchModal = document.getElementById('match-modal');
    const closeModalBtn = document.getElementById('match-modal-close');

    if (matchBtn && matchModal && closeModalBtn) {
        // Open modal
        matchBtn.addEventListener('click', () => {
            matchModal.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        // Close modal
        closeModalBtn.addEventListener('click', () => {
            matchModal.classList.remove('visible');
            document.body.style.overflow = '';
        });

        // Close modal on outside click
        matchModal.addEventListener('click', (e) => {
            if (e.target === matchModal) {
                matchModal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    }
});
