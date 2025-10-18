// scripts.js — shared site scripts
// Scroll reveal using IntersectionObserver. Adds 'in-view' to elements with class 'reveal' when they intersect.
(function(){
    'use strict';
    // Respect reduced motion
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce) {
        // Immediately reveal everything
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
                // if the element contains children with .reveal-child, stagger them
                var children = el.querySelectorAll && el.querySelectorAll('.reveal-child');
                if(children && children.length){
                    children.forEach(function(child, i){
                        child.style.transitionDelay = ((i * 80) + (parseInt(delay||0,10)||0)) + 'ms';
                        child.classList.add('in-view');
                    });
                }
                // unobserve after reveal to avoid repeated work
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
