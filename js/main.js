/* =========================================================
   PIKIRBAIK
   Main JavaScript
   Used by:
   - index.html
   - kenal-pikirbaik.html
   - feedback.html

   Responsibilities:
   - Header scroll state
   - Mobile navigation
   - Active navigation
   - Smooth scrolling
   - Hash navigation
   - Responsive navigation
   - Current year
   - External link security
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";


    /* =====================================================
       01. ELEMENT REFERENCES
    ====================================================== */

    const header = document.querySelector(".site-header");

    const mobileMenuToggle = document.querySelector("#mobile-menu-toggle");
    const mobileNav = document.querySelector("#mobile-nav");

    const desktopNavLinks = document.querySelectorAll(
        ".desktop-nav .nav-link"
    );

    const mobileNavLinks = document.querySelectorAll(
        ".mobile-nav .mobile-nav-link"
    );


    /* =====================================================
       02. HEADER SCROLL STATE
    ====================================================== */

    const handleHeaderScroll = () => {
        if (!header) return;

        if (window.scrollY > 12) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

    handleHeaderScroll();

    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        {
            passive: true
        }
    );


    /* =====================================================
       03. MOBILE NAVIGATION
    ====================================================== */

    const setMobileNavState = (isOpen) => {
        if (!mobileNav || !mobileMenuToggle) return;

        mobileNav.classList.toggle("is-open", isOpen);
        mobileMenuToggle.classList.toggle("is-active", isOpen);

        mobileMenuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        mobileMenuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Tutup menu navigasi"
                : "Buka menu navigasi"
        );

        mobileNav.setAttribute(
            "aria-hidden",
            String(!isOpen)
        );

        document.body.classList.toggle(
            "mobile-nav-open",
            isOpen
        );
    };


    const openMobileMenu = () => {
        setMobileNavState(true);
    };


    const closeMobileMenu = () => {
        setMobileNavState(false);
    };


    const toggleMobileMenu = () => {
        if (!mobileNav) return;

        const isOpen = mobileNav.classList.contains("is-open");

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    };


    if (mobileMenuToggle && mobileNav) {

        /*
         * Initial accessibility state.
         */
        setMobileNavState(false);


        /*
         * Toggle button.
         */
        mobileMenuToggle.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                toggleMobileMenu();
            }
        );


        /*
         * Close menu when a navigation link is clicked.
         */
        mobileNavLinks.forEach((link) => {
            link.addEventListener(
                "click",
                () => {
                    closeMobileMenu();
                }
            );
        });


        /*
         * Close menu when clicking outside.
         */
        document.addEventListener(
            "click",
            (event) => {

                const isOpen =
                    mobileNav.classList.contains("is-open");

                if (!isOpen) return;

                const clickedInsideNav =
                    mobileNav.contains(event.target);

                const clickedToggle =
                    mobileMenuToggle.contains(event.target);

                if (
                    !clickedInsideNav &&
                    !clickedToggle
                ) {
                    closeMobileMenu();
                }
            }
        );


        /*
         * Close menu with Escape.
         */
        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key !== "Escape") return;

                const isOpen =
                    mobileNav.classList.contains("is-open");

                if (!isOpen) return;

                closeMobileMenu();

                mobileMenuToggle.focus();
            }
        );


        /*
         * Close mobile navigation when entering desktop width.
         */
        const desktopBreakpoint = window.matchMedia(
            "(min-width: 768px)"
        );

        const handleBreakpointChange = (event) => {
            if (event.matches) {
                closeMobileMenu();
            }
        };

        if (
            typeof desktopBreakpoint.addEventListener ===
            "function"
        ) {
            desktopBreakpoint.addEventListener(
                "change",
                handleBreakpointChange
            );
        } else if (
            typeof desktopBreakpoint.addListener ===
            "function"
        ) {
            desktopBreakpoint.addListener(
                handleBreakpointChange
            );
        }
    }


    /* =====================================================
       04. NORMALIZE URL PATH
    ====================================================== */

    const normalizePath = (path) => {

        if (!path) {
            return "/";
        }

        let normalized = path;


        /*
         * Remove trailing slash except root.
         */
        if (
            normalized.length > 1 &&
            normalized.endsWith("/")
        ) {
            normalized = normalized.slice(0, -1);
        }


        /*
         * Treat /index.html as root.
         */
        if (
            normalized.endsWith("/index.html")
        ) {
            normalized = normalized.replace(
                "/index.html",
                "/"
            );
        }


        return normalized;
    };


    /* =====================================================
       05. ACTIVE NAVIGATION
    ====================================================== */

    const currentPath = normalizePath(
        window.location.pathname
    );


    const setActiveNavigation = (links) => {

        links.forEach((link) => {

            const href = link.getAttribute("href");

            if (!href) return;


            /*
             * Ignore external and special links.
             */
            if (
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) {
                return;
            }


            /*
             * Hash-only links are handled by smooth scrolling,
             * not page navigation.
             */
            if (href.startsWith("#")) {
                return;
            }


            let linkPath;

            try {

                linkPath = normalizePath(
                    new URL(
                        href,
                        window.location.href
                    ).pathname
                );

            } catch (error) {

                return;
            }


            const isCurrentPage =
                linkPath === currentPath;


            link.classList.toggle(
                "active",
                isCurrentPage
            );


            if (isCurrentPage) {

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.removeAttribute(
                    "aria-current"
                );
            }

        });
    };


    setActiveNavigation(desktopNavLinks);
    setActiveNavigation(mobileNavLinks);


    /* =====================================================
       06. HEADER OFFSET
    ====================================================== */

    const getHeaderOffset = () => {

        if (!header) {
            return 0;
        }

        return header.offsetHeight + 12;
    };


    /* =====================================================
       07. SAFE HASH SELECTOR
    ====================================================== */

    const getHashTarget = (hash) => {

        if (!hash || hash === "#") {
            return null;
        }

        try {

            return document.querySelector(hash);

        } catch (error) {

            return null;
        }
    };


    /* =====================================================
       08. SMOOTH SCROLL
    ====================================================== */

    const smoothScrollToElement = (target) => {

        if (!target) {
            return;
        }

        const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            getHeaderOffset();


        const scrollTop =
            Math.max(targetTop, 0);


        const prefersReducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        window.scrollTo({
            top: scrollTop,
            behavior: prefersReducedMotion
                ? "auto"
                : "smooth"
        });
    };


    /* =====================================================
       09. SAME-PAGE LINKS
    ====================================================== */

    const samePageLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    samePageLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    href === "#"
                ) {
                    return;
                }


                const target =
                    getHashTarget(href);


                if (!target) {
                    return;
                }


                /*
                 * Prevent default jump.
                 */
                event.preventDefault();


                /*
                 * Close mobile navigation
                 * when scrolling to a section.
                 */
                if (
                    mobileNav &&
                    mobileNav.classList.contains("is-open")
                ) {
                    closeMobileMenu();
                }


                smoothScrollToElement(target);


                /*
                 * Update browser URL without reload.
                 */
                if (
                    window.history &&
                    typeof window.history.pushState ===
                    "function"
                ) {

                    window.history.pushState(
                        null,
                        "",
                        href
                    );
                }

            }
        );
    });


    /* =====================================================
       10. INITIAL HASH
    ====================================================== */

    const scrollToInitialHash = () => {

        const hash =
            window.location.hash;


        if (!hash) {
            return;
        }


        const target =
            getHashTarget(hash);


        if (!target) {
            return;
        }


        /*
         * Wait until layout has settled.
         */
        window.requestAnimationFrame(() => {

            window.setTimeout(() => {

                smoothScrollToElement(target);

            }, 50);

        });
    };


    scrollToInitialHash();


    /* =====================================================
       11. RESPONSIVE RESIZE
    ====================================================== */

    let resizeTimer = null;


    window.addEventListener(
        "resize",
        () => {

            window.clearTimeout(resizeTimer);


            resizeTimer = window.setTimeout(
                () => {

                    if (
                        window.innerWidth >= 768 &&
                        mobileNav &&
                        mobileNav.classList.contains("is-open")
                    ) {
                        closeMobileMenu();
                    }

                },
                150
            );

        }
    );


    /* =====================================================
       12. CURRENT YEAR
    ====================================================== */

    const currentYear =
        new Date().getFullYear();


    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    yearElements.forEach((element) => {

        element.textContent =
            String(currentYear);

    });


    /* =====================================================
       13. EXTERNAL LINK SECURITY
    ====================================================== */

    const externalLinks =
        document.querySelectorAll(
            'a[target="_blank"]'
        );


    externalLinks.forEach((link) => {

        const rel =
            link.getAttribute("rel") || "";


        const relValues =
            new Set(
                rel
                    .split(/\s+/)
                    .filter(Boolean)
            );


        relValues.add("noopener");
        relValues.add("noreferrer");


        link.setAttribute(
            "rel",
            Array.from(relValues).join(" ")
        );

    });


    /* =====================================================
       14. JAVASCRIPT STATE
    ====================================================== */

    document.documentElement.classList.add(
        "js-enabled"
    );

});