// Show elements when user scrolls to them
// Add 'in-view' class when elements with .reveal become visible
(function(){
    'use strict';
    // Check if user prefers less motion
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce) {
        // Show everything right away
        document.addEventListener('DOMContentLoaded', function(){
            document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
        });
        return;
    }

    function onIntersect(entries, obs){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                var el = entry.target;
                var delay = el.getAttribute('data-reveal-delay');
                if(delay){ el.style.transitionDelay = delay + 'ms'; }
                el.classList.add('in-view');
                // Show child elements with stagger effect
                var children = el.querySelectorAll && el.querySelectorAll('.reveal-child');
                if(children && children.length){
                    children.forEach(function(child, i){
                        child.style.transitionDelay = ((i * 80) + (parseInt(delay||0,10)||0)) + 'ms';
                        child.classList.add('in-view');
                    });
                }
                // Stop watching after revealed
                obs.unobserve(el);
            }
        });
    }

    var observer = new IntersectionObserver(onIntersect, { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    function init(){
        document.querySelectorAll('.reveal').forEach(function(el){ observer.observe(el); });
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Responsive navigation menu
// On medium screens: move overflow items to "More" dropdown
// On mobile: use hamburger menu
(function(){
    'use strict';
    
    function initResponsiveNav(){
        var header = document.querySelector('.header');
        var nav = document.querySelector('.nav-links');
        var hamburger = document.querySelector('.nav-toggle');
        if(!header || !nav) return;

        var navLinks = Array.from(nav.querySelectorAll('a'));
        var moreBtn = null;
        var moreDropdown = null;
        var isSmallScreen = false;

        // Create "More" button and dropdown menu
        function createMoreMenu(){
            if(moreBtn) return; // already made
            
            moreBtn = document.createElement('button');
            moreBtn.className = 'more-menu-btn';
            moreBtn.textContent = 'MORE ▾';
            moreBtn.setAttribute('aria-label', 'Show more navigation items');
            moreBtn.setAttribute('aria-expanded', 'false');
            
            moreDropdown = document.createElement('div');
            moreDropdown.className = 'more-dropdown';
            
            moreBtn.appendChild(moreDropdown);
            nav.appendChild(moreBtn);
            
            // Open/close dropdown on click
            moreBtn.addEventListener('click', function(e){
                e.stopPropagation();
                var isOpen = moreDropdown.classList.toggle('open');
                moreBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(){
                moreDropdown.classList.remove('open');
                moreBtn.setAttribute('aria-expanded', 'false');
            });
        }

        // Check if nav items fit, move extras to dropdown if needed
        function handleOverflow(){
            // On small screens, use hamburger instead
            var width = window.innerWidth;
            isSmallScreen = width <= 768;
            
            if(isSmallScreen){
                // Hide "More" menu on mobile
                if(moreBtn) moreBtn.style.display = 'none';
                return;
            }

            // On bigger screens: check if items fit
            if(!moreBtn) createMoreMenu();
            
            // Put all links back in main nav first
            navLinks.forEach(function(link){
                link.style.display = '';
                if(link.parentNode !== nav){
                    nav.insertBefore(link, moreBtn);
                }
            });
            moreDropdown.innerHTML = '';
            moreBtn.style.display = 'none';

            // Wait a bit for layout to update
            setTimeout(function(){
                // Check if items overflow
                var headerWidth = header.offsetWidth;
                var logoWidth = document.querySelector('.logo') ? document.querySelector('.logo').offsetWidth : 0;
                var availableWidth = headerWidth - logoWidth - 150; // leave some space
                
                var totalWidth = 0;
                var overflowLinks = [];
                
                navLinks.forEach(function(link){
                    var linkWidth = link.offsetWidth || link.getBoundingClientRect().width;
                    totalWidth += linkWidth + 32; // add gap space
                    if(totalWidth > availableWidth){
                        overflowLinks.push(link);
                    }
                });

                // Move overflow items to dropdown
                if(overflowLinks.length > 0){
                    moreBtn.style.display = 'block';
                    overflowLinks.forEach(function(link){
                        var clone = link.cloneNode(true);
                        moreDropdown.appendChild(clone);
                        link.style.display = 'none';
                    });
                }
            }, 50);
        }

        // Hamburger menu for mobile phones
        function initMobileNav(){
            if(!hamburger || !nav) return;

            hamburger.setAttribute('aria-controls', 'main-nav');
            nav.id = nav.id || 'main-nav';
            hamburger.setAttribute('aria-expanded', 'false');

            function closeNav(){
                nav.classList.remove('open');
                nav.style.maxHeight = '0px';
                hamburger.setAttribute('aria-expanded', 'false');
            }

            hamburger.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                var isOpen = nav.classList.contains('open');
                
                if(!isOpen){
                    nav.classList.add('open');
                    // Set height to show all links
                    nav.style.maxHeight = '500px';
                    hamburger.setAttribute('aria-expanded', 'true');
                } else {
                    closeNav();
                }
            });

            document.addEventListener('click', function(e){
                if(!nav.classList.contains('open')) return;
                if(e.target === hamburger || nav.contains(e.target)) return;
                closeNav();
            });

            document.addEventListener('keydown', function(e){
                if(e.key === 'Escape' && nav.classList.contains('open')){
                    closeNav();
                    hamburger.focus();
                }
            });
        }

        // Start everything
        handleOverflow();
        initMobileNav();

        // Check again when window size changes
        var resizeTimer;
        window.addEventListener('resize', function(){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleOverflow, 150);
        });
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initResponsiveNav); 
    else initResponsiveNav();
})();
