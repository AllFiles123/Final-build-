/* =====================================================
   SELL MEK - ORIGINAL HERO + COUNT ANIMATION
===================================================== */


/* =====================================================
   COUNTING ANIMATION
   Works for Hero Dashboard and Results sections
===================================================== */

function animateSingleCount(el, index = 0) {
    if (!el || el.dataset.countAnimated === "true") return;
    el.dataset.countAnimated = "true";

    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const useComma = el.getAttribute("data-comma") === "true";
    const duration = 1800;
    const delay = index * 80;

    setTimeout(() => {
        const startTime = performance.now();
        function update(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const easing = 1 - Math.pow(1 - progress, 3);
            const current = target * easing;
            const display = target % 1 !== 0 ? current.toFixed(1) : Math.floor(current);
            const number = useComma ? Number(display).toLocaleString() : display;
            el.textContent = prefix + number + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                const finalNumber = useComma ? target.toLocaleString() : target;
                el.textContent = prefix + finalNumber + suffix;
            }
        }
        requestAnimationFrame(update);
    }, delay);
}

function animateCounts() {
    const counters = Array.from(document.querySelectorAll(".count"));
    if (!counters.length) return;

    const startVisible = (elements) => {
        elements.forEach((el, index) => animateSingleCount(el, index));
    };

    if (!("IntersectionObserver" in window)) {
        startVisible(counters);
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateSingleCount(entry.target);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    counters.forEach(el => observer.observe(el));
}

/* =====================================================
   SOCIAL ICON ENDLESS SCROLL ANIMATION
===================================================== */

function animateSocialIcons() {

    const social =
        document.querySelector(".social");

    const items = Array.from(
        document.querySelectorAll(
            ".social .social-item"
        )
    );

    if (
        !social ||
        !items.length ||
        social.dataset.animated === "true"
    ) {
        return;
    }

    social.dataset.animated = "true";

    /* Duplicate icons for seamless movement */
    items.forEach(item => {

        const clone = item.cloneNode(true);

        clone.setAttribute(
            "aria-hidden",
            "true"
        );

        clone.tabIndex = -1;

        social.appendChild(clone);
    });

    const itemHeight = 55;
    const loopHeight =
        items.length * itemHeight;

    let position = 0;
    let lastTime = null;

    const speed = 28;

    function move(time) {

        if (lastTime === null) {
            lastTime = time;
        }

        const delta =
            (time - lastTime) / 1000;

        lastTime = time;

        position -= speed * delta;

        if (Math.abs(position) >= loopHeight) {
            position += loopHeight;
        }

        social
            .querySelectorAll(".social-item")
            .forEach(item => {

                item.style.transform =
                    `translateY(${position}px)`;

            });

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}




/* =====================================================
   SECTION REVEAL ANIMATIONS
   Headings fade in, then result cards appear one by one.
===================================================== */
function setupSectionAnimations() {
    const headings = document.querySelectorAll('.dark-section-heading');
    const cards = Array.from(document.querySelectorAll('.results-counter-grid .dark-result-card'));

    if ('IntersectionObserver' in window) {
        const headingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('heading-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.28 });
        headings.forEach(h => headingObserver.observe(h));

        if (cards.length) {
            const revealCardsSequentially = () => {
                let current = 0;
                const revealNext = () => {
                    if (current >= cards.length) return;
                    const card = cards[current++];
                    const onFinished = (event) => {
                        if (event.target !== card || event.propertyName !== 'transform') return;
                        card.removeEventListener('transitionend', onFinished);
                        revealNext();
                    };
                    card.addEventListener('transitionend', onFinished);
                    requestAnimationFrame(() => card.classList.add('card-visible'));
                    // Safety fallback if a browser does not fire transitionend.
                    window.setTimeout(() => {
                        card.removeEventListener('transitionend', onFinished);
                        if (current <= cards.length && !cards[current]?.classList.contains('card-visible')) revealNext();
                    }, 750);
                };
                revealNext();
            };

            const cardsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    revealCardsSequentially();
                });
            }, { threshold: 0.22 });
            cardsObserver.observe(document.querySelector('.results-counter-grid'));
        }
    } else {
        headings.forEach(h => h.classList.add('heading-visible'));
        // No artificial delay: each card starts immediately after the previous reveal completes.
        cards.reduce((chain, card) => chain.then(() => new Promise(resolve => {
            const done = () => { card.removeEventListener('transitionend', done); resolve(); };
            card.addEventListener('transitionend', done);
            requestAnimationFrame(() => card.classList.add('card-visible'));
            window.setTimeout(done, 750);
        })), Promise.resolve());
    }
}



/* =====================================================
   HERO HEADLINE SLIDER — SLOW ENTERPRISE MOTION
===================================================== */
function setupHeroSlider() {
    const slider = document.querySelector(".hero-slider");
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const counter = document.querySelector("#hero-current");

    if (!slider || slides.length < 2) return;

    let current = 0;
    const interval = 8500;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            const active = i === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", active ? "false" : "true");
        });

        if (counter) counter.textContent = String(index + 1);
    }

    showSlide(current);

    window.setInterval(() => {
        current = (current + 1) % slides.length;
        showSlide(current);
    }, interval);
}




/* =====================================================
   CLIENT REVIEW SLIDER — SLOW 3-REVIEW LOOP
   Right -> highlight slightly upward -> left -> next
===================================================== */
function setupClientReviews() {
    // Reviews are rendered as a CSS-driven, continuous right-to-left marquee.
    // Hovering .vertical-reviews pauses the track.
}



/* =====================================================
   BUTTON ACTIONS
===================================================== */

function setupButtons() {

    // ".start" is now a direct link to booking.html (Book a Meeting),
    // so it needs no scroll-to-section click handler.

    const contact =
        document.querySelector(".contact");


    if (contact) {

        contact.addEventListener(
            "click",
            () => {

                const footer =
                    document.querySelector(
                        ".site-footer"
                    );

                if (footer) {

                    footer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );
    }
}




/* =====================================================
   BOOKING FORM
===================================================== */
function setupBookingForm() {
    const form = document.getElementById("booking-form");
    const success = document.getElementById("booking-success");
    const again = document.getElementById("booking-again-btn");
    if (!form || !success) return;

    const dateInput = document.getElementById("bk-date");
    if (dateInput) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        dateInput.min = today.toISOString().split("T")[0];
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const formData = new FormData(form);
        const dateValue = String(formData.get("date") || "");
        const timeValue = String(formData.get("time") || "00:00");
        const timestamp = new Date(`${dateValue}T${timeValue}`).getTime();
        saveMeeting({
            name: formData.get("name"), company: formData.get("company"),
            date: dateValue, time: timeValue, service: formData.get("service"),
            meetingType: formData.get("meetingType"), details: formData.get("details"),
            clientLink: formData.get("clientLink"),
            timestamp: Number.isFinite(timestamp) ? timestamp : Date.now()
        });
        success.classList.add("is-visible");
        success.setAttribute("aria-hidden", "false");
    });

    if (again) {
        again.addEventListener("click", () => {
            success.classList.remove("is-visible");
            success.setAttribute("aria-hidden", "true");
            form.reset();
            window.setTimeout(() => {
                const first = document.getElementById("bk-name");
                if (first) first.focus();
            }, 220);
        });
    }
}

/* =====================================================
   PAGE-TRANSITION LOADER
   Shows a full-screen loading animation whenever the visitor
   navigates from one nav-bar link to another (or any internal
   page link), then fades it out once the new page has painted.
===================================================== */
function setupPageLoader() {

    let loader = document.querySelector(".page-loader");

    if (!loader) {
        loader = document.createElement("div");
        loader.className = "page-loader";
        loader.innerHTML =
            '<div class="page-loader-mark">' +
                '<div class="page-loader-brand"><img src="assets/images/logo.png" alt="Sell Mek"></div>' +
                '<span class="page-loader-label">Digital Growth Agency</span>' +
                '<span class="page-loader-sub">Preparing your growth experience</span>' +
                '<div class="page-loader-progress" aria-hidden="true"></div>' +
            "</div>";
        document.body.appendChild(loader);
    }

    /* Entrance: fade the loader out once this page is ready. */
    window.requestAnimationFrame(() => {
        window.setTimeout(() => {
            loader.classList.add("is-hidden");
        }, 260);
    });

    const isSamePageAnchor = (link) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("#")) return true;
        if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
        if (link.target === "_blank") return true;
        if (link.hasAttribute("download")) return true;
        return false;
    };

    /* Any internal link that points to one of the site's own
       .html pages gets the transition treatment: nav bar links,
       the logo, footer links, and in-page CTA links alike. */
    const links = Array.from(document.querySelectorAll('a[href$=".html"]'));

    links.forEach((link) => {

        if (isSamePageAnchor(link)) return;

        link.addEventListener("click", (event) => {

            const href = link.getAttribute("href");

            /* Let modified clicks (open in new tab, etc.) behave normally. */
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            event.preventDefault();

            loader.classList.remove("is-hidden");

            window.setTimeout(() => {
                window.location.href = href;
            }, 380);
        });
    });
}


/* =====================================================
   PROCESS FLOW — CONNECT THE DOTTED PATH TO THE CIRCLES
   Draws the dashed connector as an SVG line measured against
   the actual rendered position of each step circle, so it
   always lines up correctly regardless of screen width.
===================================================== */
function setupProcessPath() {

    const flow = document.querySelector(".reference-process-flow");
    const pathWrap = document.querySelector(".reference-process-path");
    const cards = Array.from(document.querySelectorAll(".reference-process-card"));

    if (!flow || !pathWrap || cards.length < 2) return;

    /* Replace the old fixed-angle dashed segments with a single
       SVG that is redrawn to match the circles' real positions. */
    let svg = pathWrap.querySelector("svg.process-path-svg");
    if (!svg) {
        pathWrap.querySelectorAll(".path-segment, .path-start").forEach(el => el.remove());
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "process-path-svg");
        svg.style.position = "absolute";
        svg.style.inset = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        const startDot = document.createElementNS(svg.namespaceURI, "circle");
        startDot.setAttribute("class", "process-path-start-dot");
        startDot.setAttribute("r", "9");

        const line = document.createElementNS(svg.namespaceURI, "polyline");
        line.setAttribute("class", "process-path-line");
        line.setAttribute("fill", "none");

        svg.appendChild(line);
        svg.appendChild(startDot);
        pathWrap.appendChild(svg);
    }

    const line = svg.querySelector(".process-path-line");
    const startDot = svg.querySelector(".process-path-start-dot");
    const arrow = pathWrap.querySelector(".path-arrow");

    function draw() {
        const flowBox = flow.getBoundingClientRect();
        if (!flowBox.width || !flowBox.height) return;

        const centers = cards.map(card => {
            const box = card.getBoundingClientRect();
            return {
                x: box.left + box.width / 2 - flowBox.left,
                y: box.top + box.height / 2 - flowBox.top
            };
        });

        /* On the stacked mobile layout the path is hidden by CSS,
           so skip the (irrelevant) measurement work there. */
        if (getComputedStyle(pathWrap).display === "none") return;

        const points = centers.map(p => `${p.x},${p.y}`).join(" ");
        line.setAttribute("points", points);

        /* Start marker sits just outside the first circle, on the left,
           vertically aligned with its center — like the original design. */
        const first = centers[0];
        startDot.setAttribute("cx", 11);
        startDot.setAttribute("cy", first.y);

        /* End arrow sits just outside the last circle, on the right,
           vertically aligned with its center, tilted to follow the
           incoming line's slope. */
        if (arrow) {
            const last = centers[centers.length - 1];
            const prev = centers[centers.length - 2];
            const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * (180 / Math.PI);
            arrow.style.left = "auto";
            arrow.style.right = "0";
            arrow.style.top = `${last.y}px`;
            arrow.style.transform = `translateY(-50%) rotate(${angle}deg)`;
        }
    }

    draw();
    window.addEventListener("resize", draw);

    /* Re-measure once webfonts/layout settle (card copy can reflow). */
    window.setTimeout(draw, 200);
    window.setTimeout(draw, 700);
}


/* =====================================================
   ENTERPRISE NAVIGATION — BRAND + PROFILE MENU
===================================================== */
function setupEnterpriseNavigation(){
    const headers=document.querySelectorAll('.header');
    headers.forEach(header=>{
        const nav=header.querySelector('.nav');
        const logo=header.querySelector(':scope > .logo');
        if(nav && logo && !nav.querySelector('.nav-brand')){
            logo.classList.add('nav-brand');
            nav.insertBefore(logo,nav.firstChild);
        }

        const profile=nav?.querySelector('.profile-trigger') || nav?.querySelector('a[href="language.html"]');
        if(!profile || header.querySelector('.profile-menu')) return;
        profile.classList.add('profile-trigger');
        profile.setAttribute('aria-haspopup','menu');
        profile.setAttribute('aria-expanded','false');

        const menu=document.createElement('div');
        menu.className='profile-menu';
        menu.setAttribute('role','menu');
        menu.innerHTML=`<div class="profile-name"><small>CLIENT SPACE</small><strong>Sell Mek Account</strong></div>
            <a href="language.html" role="menuitem"><i class="fa-solid fa-language"></i>Language</a>
            <a href="index.html" class="profile-logout" role="menuitem"><i class="fa-solid fa-right-from-bracket"></i>Log out</a>`;
        document.body.appendChild(menu);
        menu.querySelector('.profile-logout')?.addEventListener('click',e=>{
            e.preventDefault();
            try{
                localStorage.removeItem('sellmekMeetings');
                localStorage.removeItem('sellmekMeetingsHistory');
            }catch(_){}
            close();
            window.location.href='index.html';
        });

        const close=()=>{menu.classList.remove('is-open');profile.setAttribute('aria-expanded','false');};
        const position=()=>{
            const r=profile.getBoundingClientRect();
            const w=220;
            menu.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.right-w))+'px';
            menu.style.top=Math.min(window.innerHeight-12,r.bottom+8)+'px';
        };
        profile.addEventListener('click',e=>{e.preventDefault();if(menu.classList.contains('is-open')) close();else{position();menu.classList.add('is-open');profile.setAttribute('aria-expanded','true');}});
        document.addEventListener('click',e=>{if(e.target!==profile&&!profile.contains(e.target)&&!menu.contains(e.target)) close();});
        window.addEventListener('resize',()=>{if(menu.classList.contains('is-open')) position();});
        window.addEventListener('scroll',()=>{if(menu.classList.contains('is-open')) position();},{passive:true});
    });
}

/* =====================================================
   SUBTLE ENTERPRISE TILT — POINTER DEVICES ONLY
===================================================== */
function setupPremiumCardMotion(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.solution-card,.case-preview-grid article,.service-objective-grid a').forEach(card=>{
        card.addEventListener('pointermove',e=>{
            const r=card.getBoundingClientRect();
            const x=(e.clientX-r.left)/r.width-.5;
            const y=(e.clientY-r.top)/r.height-.5;
            card.style.transform=`perspective(700px) rotateX(${(-y*2.5).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
}


/* =====================================================
   SERVICE SEARCH — instant suggestions from live service cards
===================================================== */
function setupServiceSearch(){
    const input=document.querySelector('#service-search-input');
    const results=document.querySelector('#service-search-results');
    const clear=document.querySelector('#service-search-clear');
    if(!input || !results) return;

    const cards=[...document.querySelectorAll('.service-reference-track > .service-reference-card:not([aria-hidden="true"])')];
    const services=cards.map(card=>({
        name:card.querySelector('h2')?.textContent.replace(/\s+/g,' ').trim() || '',
        description:card.querySelector('p')?.textContent.trim() || '',
        href:card.querySelector('a')?.getAttribute('href') || '#',
        icon:card.querySelector('.service-reference-icon i')?.className || 'fa-solid fa-layer-group'
    })).filter(x=>x.name);

    function render(){
        const q=input.value.trim().toLowerCase();
        clear.hidden=!q;
        const matches=services.filter(s=>
            !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        );

        results.innerHTML='';
        if(!q){
            results.classList.remove('is-open');
            return;
        }
        results.classList.add('is-open');
        if(!matches.length){
            results.innerHTML='<div class="service-search-empty">No matching service found.</div>';
            return;
        }
        matches.forEach((s)=>{
            const a=document.createElement('a');
            a.href=s.href;
            a.className='service-search-item';
            a.setAttribute('role','option');
            a.innerHTML=`<span class="service-search-item-icon"><i class="${s.icon}" aria-hidden="true"></i></span>
                         <span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.description)}</small></span>
                         <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>`;
            results.appendChild(a);
        });
    }

    input.addEventListener('input',render);
    input.addEventListener('focus',()=>{ if(input.value.trim()) render(); });
    clear?.addEventListener('click',()=>{input.value='';render();input.focus();});
    document.addEventListener('click',e=>{
        if(!e.target.closest('.service-search')) results.classList.remove('is-open');
    });
}

/* =====================================================
   START WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Original-style number animation */
        animateCounts();

        /* Persistent meeting badge and history */
        updateMeetingBadges();
        setupMeetingHistory();
        setupEnterpriseNavigation();
        setupPremiumCardMotion();
        setupGrowthBannerSlider();
        setupServicesSlider();
        setupServiceSearch();

        /* Social icons */
        animateSocialIcons();

        /* Hero headline slider */
        setupHeroSlider();

        /* Client review slider */
        setupClientReviews();

        /* Booking form */
        setupBookingForm();

        /* Contact form */
        setupContactForm();

        /* Buttons */
        setupButtons();

        /* Results and heading reveal effects */
        setupSectionAnimations();

        /* Loading animation between nav / page transitions */
        setupPageLoader();

        /* Keep the "Process We Follow" dotted path locked to the circles */
        setupProcessPath();

    }
);
/* =====================================================
   SELL MEK GROWTH BANNER SLIDER
===================================================== */
function setupGrowthBannerSlider(){
    const track=document.querySelector('.growth-banner-track');
    if(!track) return;
    const slides=Array.from(track.querySelectorAll('.growth-banner'));
    const dotsWrap=document.querySelector('.growth-slider-dots');
    let current=0, timer;
    if(!slides.length) return;
    const dots=slides.map((_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to banner ${i+1}`);b.addEventListener('click',()=>go(i,true));dotsWrap&&dotsWrap.appendChild(b);return b;});
    function go(index,reset=false){current=(index+slides.length)%slides.length;track.style.transform=`translate3d(-${current*100}%,0,0)`;slides.forEach((s,i)=>s.classList.toggle('is-active',i===current));dots.forEach((d,i)=>d.classList.toggle('active',i===current));if(reset) restart();}
    function restart(){clearInterval(timer);timer=setInterval(()=>go(current+1),6500);}
    document.querySelector('[data-growth-prev]')?.addEventListener('click',()=>go(current-1,true));
    document.querySelector('[data-growth-next]')?.addEventListener('click',()=>go(current+1,true));
    track.parentElement.addEventListener('mouseenter',()=>clearInterval(timer));track.parentElement.addEventListener('mouseleave',restart);
    go(0);restart();
}

/* =====================================================
   SERVICES MANUAL SLIDER (DESKTOP)
===================================================== */
function setupServicesSlider(){
 const viewport=document.querySelector('.services-reference-viewport'), track=document.querySelector('.services-reference-track');
 if(!viewport||!track) return;
 const cards=Array.from(track.querySelectorAll('.service-reference-card'));
 let index=0;
 function render(){if(window.innerWidth<=900){track.style.transform='';return;} const card=cards[0];if(!card)return;const gap=parseFloat(getComputedStyle(track).gap)||30;const max=Math.max(0,cards.length-2);index=Math.max(0,Math.min(index,max));track.style.transform=`translate3d(-${index*(card.getBoundingClientRect().width+gap)}px,0,0)`;}
 document.querySelector('.services-prev')?.addEventListener('click',()=>{index--;render();});document.querySelector('.services-next')?.addEventListener('click',()=>{index++;render();});window.addEventListener('resize',render);render();
}

/* =====================================================
   MEETING HISTORY — LOCAL BOOKING STORAGE + LIVE COUNTDOWN
===================================================== */
function getMeetings(){try{return JSON.parse(localStorage.getItem('sellmekMeetings')||'[]');}catch(e){return [];}}
function getMeetingSeenCount(){return Number(localStorage.getItem('sellmekHistorySeenCount')||0);}
function markMeetingHistorySeen(){localStorage.setItem('sellmekHistorySeenCount',String(getMeetings().length));}
function updateMeetingBadges(){
 const meetings=getMeetings();
 const unread=Math.max(0,meetings.length-getMeetingSeenCount());
 document.querySelectorAll('.meeting-badge').forEach(b=>{b.textContent=unread;b.classList.toggle('is-visible',unread>0);});
}
function saveMeeting(data){
 const all=getMeetings();
 all.unshift(data);
 localStorage.setItem('sellmekMeetings',JSON.stringify(all));
 updateMeetingBadges();
}
function setupMeetingHistory(){
 const list=document.getElementById('meeting-history-list');if(!list)return;
 /* Opening Meeting History clears its unread navigation badge. */
 markMeetingHistorySeen();
 updateMeetingBadges();
 const summaryBar=document.getElementById('history-summary-bar');
 const meetings=getMeetings();
 if(!meetings.length){
     list.innerHTML='<div class="meeting-empty"><i class="fa-regular fa-calendar-xmark"></i><h2>No meetings booked yet</h2><p>When you book a meeting, its details and live countdown will appear here.</p><a href="booking.html">Book a Meeting →</a></div>';
     if(summaryBar) summaryBar.innerHTML='';
     return;
 }
 if(summaryBar){
     const upcoming=meetings.filter(m=>Number(m.timestamp)>=Date.now()).length;
     const nextDate=meetings[0]&&meetings[0].date?meetings[0].date:'—';
     summaryBar.innerHTML=`
        <div class="history-summary-card"><span class="history-summary-icon"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i></span><div class="history-summary-text"><span>Total Booked</span><strong>${meetings.length}</strong></div></div>
        <div class="history-summary-card"><span class="history-summary-icon"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i></span><div class="history-summary-text"><span>Upcoming</span><strong>${upcoming}</strong></div></div>
        <div class="history-summary-card"><span class="history-summary-icon"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i></span><div class="history-summary-text"><span>Next Meeting</span><strong>${escapeHtml(nextDate)}</strong></div></div>`;
 }
 list.innerHTML=meetings.map((m,i)=>{
     const ref='SM-'+String(m.timestamp).slice(-6);
     const linkRow=m.clientLink?`<div class="meeting-link-row"><i class="fa-solid fa-link" aria-hidden="true"></i> <a href="${escapeHtml(m.clientLink)}" target="_blank" rel="noopener">${escapeHtml(m.clientLink)}</a></div>`:'';
     return `<article class="meeting-history-card" data-meeting-time="${m.timestamp}"><span class="meeting-ref">Ref #${ref}</span><span class="meeting-status">${i===0?'NEXT MEETING':'BOOKED'}</span><h2>${escapeHtml(m.service||'Sell Mek Strategy Meeting')}</h2><div class="meeting-meta"><span><i class="fa-regular fa-calendar"></i>${escapeHtml(m.date)}</span><span><i class="fa-regular fa-clock"></i>${escapeHtml(m.time)}</span><span><i class="fa-solid fa-building"></i>${escapeHtml(m.company||'Your business')}</span><span><i class="fa-solid fa-video"></i>${escapeHtml(m.meetingType||'Meeting')}</span></div><p class="meeting-person">Booked for <strong>${escapeHtml(m.name||'Client')}</strong>${m.details?` — ${escapeHtml(m.details)}`:''}</p>${linkRow}<div class="meeting-countdown"><div class="countdown-unit"><b data-days>00</b><small>DAYS</small></div><div class="countdown-unit"><b data-hours>00</b><small>HOURS</small></div><div class="countdown-unit"><b data-minutes>00</b><small>MINUTES</small></div><div class="countdown-unit"><b data-seconds>00</b><small>SECONDS</small></div></div></article>`;
 }).join('');
 const tick=()=>list.querySelectorAll('.meeting-history-card').forEach(card=>{const diff=Math.max(0,Number(card.dataset.meetingTime)-Date.now());const days=Math.floor(diff/86400000),hrs=Math.floor(diff/3600000)%24,mins=Math.floor(diff/60000)%60,secs=Math.floor(diff/1000)%60;card.querySelector('[data-days]').textContent=String(days).padStart(2,'0');card.querySelector('[data-hours]').textContent=String(hrs).padStart(2,'0');card.querySelector('[data-minutes]').textContent=String(mins).padStart(2,'0');card.querySelector('[data-seconds]').textContent=String(secs).padStart(2,'0');});tick();setInterval(tick,1000);
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

/* =====================================================
   CONTACT PAGE FORM
===================================================== */
function setupContactForm(){
    const form=document.getElementById('contact-form');
    const success=document.getElementById('contact-form-success');
    if(!form) return;
    form.addEventListener('submit',(event)=>{
        event.preventDefault();
        if(!form.checkValidity()){form.reportValidity();return;}
        if(success){success.classList.add('is-visible');}
        form.reset();
    });
}

/* =====================================================
   FULL HERO VISUAL LOOP
   Banner -> existing Growth Dashboard -> Banner
   Hero headline + original CTA buttons remain independent.
===================================================== */
function animateHeroDashboardCounts(){
    const dashboard = document.querySelector('.hero-stage-dashboard .dashboard');
    if(!dashboard) return;

    /* Restart the dashboard numbers whenever the dashboard stage appears. */
    dashboard.querySelectorAll('.count').forEach((el, index) => {
        el.dataset.countAnimated = 'false';
        el.textContent = '0';
        animateSingleCount(el, index);
    });
}

function setupHeroVisualLoop(){
    const hero = document.querySelector('.hero');
    const slider = document.querySelector('.hero-visual-slider');
    const slides = Array.from(document.querySelectorAll('.hero-visual-slide'));
    const dashboard = document.querySelector('.center-content > .dashboard');
    const dashboardStage = document.querySelector('.hero-stage-dashboard');

    if(!hero || !slider || slides.length !== 3 || !dashboard || !dashboardStage) return;

    /* There is one real dashboard. Move it into the middle visual stage so
       the photo -> dashboard -> photo sequence can never create a duplicate. */
    dashboardStage.appendChild(dashboard);

    let current = 0;
    const interval = 6500;

    function show(index){
        current = (index + slides.length) % slides.length;
        slides.forEach((slide,i)=>{
            slide.classList.toggle('is-active', i === current);
        });

        if(current === 1){
            window.setTimeout(animateHeroDashboardCounts, 350);
        }
    }

    show(0);
    window.setInterval(()=>show(current + 1), interval);
}

if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setupHeroVisualLoop);
}else{
    setupHeroVisualLoop();
}
