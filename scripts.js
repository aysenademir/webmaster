// Shared site scripts
// Scroll reveal: add 'in-view' to elements with .reveal when visible
(function(){
    'use strict';
    // Respect reduced motion preference
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce) {
        // reveal everything immediately
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
                // stagger .reveal-child elements if present
                var children = el.querySelectorAll && el.querySelectorAll('.reveal-child');
                if(children && children.length){
                    children.forEach(function(child, i){
                        child.style.transitionDelay = ((i * 80) + (parseInt(delay||0,10)||0)) + 'ms';
                        child.classList.add('in-view');
                    });
                }
                // stop observing once revealed
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

// Responsive nav: overflow items go into "More" dropdown on medium screens, full hamburger on mobile
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

        // Create "More" button and dropdown
        function createMoreMenu(){
            if(moreBtn) return; // already created
            
            moreBtn = document.createElement('button');
            moreBtn.className = 'more-menu-btn';
            moreBtn.textContent = 'MORE ▾';
            moreBtn.setAttribute('aria-label', 'Show more navigation items');
            moreBtn.setAttribute('aria-expanded', 'false');
            
            moreDropdown = document.createElement('div');
            moreDropdown.className = 'more-dropdown';
            
            moreBtn.appendChild(moreDropdown);
            nav.appendChild(moreBtn);
            
            // Toggle dropdown on click
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

        // Check if nav items overflow and move extras to dropdown
        function handleOverflow(){
            // On very small screens (mobile), use hamburger menu instead
            var width = window.innerWidth;
            isSmallScreen = width <= 768;
            
            if(isSmallScreen){
                // Mobile: hide more menu, hamburger handles everything
                if(moreBtn) moreBtn.style.display = 'none';
                return;
            }

            // Desktop/tablet: check for overflow
            if(!moreBtn) createMoreMenu();
            
            // Reset: show all links in main nav
            navLinks.forEach(function(link){
                link.style.display = '';
                nav.insertBefore(link, moreBtn);
            });
            moreDropdown.innerHTML = '';
            moreBtn.style.display = 'none';

            // Check if items overflow
            var headerWidth = header.offsetWidth;
            var logoWidth = document.querySelector('.logo').offsetWidth;
            var availableWidth = headerWidth - logoWidth - 100; // 100px buffer
            
            var totalWidth = 0;
            var overflowLinks = [];
            
            navLinks.forEach(function(link){
                totalWidth += link.offsetWidth + 32; // 32px for gap (2rem)
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
        }

        // Hamburger menu for mobile (existing functionality)
        function initMobileNav(){
            if(!hamburger || !nav) return;

            hamburger.setAttribute('aria-controls', 'main-nav');
            nav.id = nav.id || 'main-nav';
            hamburger.setAttribute('aria-expanded', 'false');

            function closeNav(){
                nav.style.maxHeight = '0px';
                nav.style.opacity = '0';
                hamburger.setAttribute('aria-expanded', 'false');
                setTimeout(function(){ nav.classList.remove('open'); }, 320);
            }

            hamburger.addEventListener('click', function(e){
                e.preventDefault();
                var isOpen = nav.classList.contains('open');
                
                if(!isOpen){
                    nav.classList.add('open');
                    var fullHeight = nav.scrollHeight;
                    nav.style.maxHeight = fullHeight + 'px';
                    nav.style.opacity = '1';
                    hamburger.setAttribute('aria-expanded', 'true');
                    var firstLink = nav.querySelector('a');
                    if(firstLink) firstLink.focus();
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

        // Init
        handleOverflow();
        initMobileNav();

        // Re-check on resize
        var resizeTimer;
        window.addEventListener('resize', function(){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleOverflow, 150);
        });
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initResponsiveNav); 
    else initResponsiveNav();
})();
