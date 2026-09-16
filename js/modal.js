document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /*
    |--------------------------------------------------------------------------
    | Contact Modal
    |--------------------------------------------------------------------------
    | Modal ini hanya digunakan untuk fitur "Hubungi Kami".
    |
    | Fitur:
    | - Open / close modal
    | - Close melalui tombol X
    | - Close melalui overlay
    | - Close melalui tombol Escape
    | - Focus trap
    | - Restore focus ke elemen sebelumnya
    | - Lock body scroll ketika modal terbuka
    | - Menggunakan inert untuk background content
    | - Menjaga state inert dan overflow sebelumnya
    |--------------------------------------------------------------------------
    */

    const modal = document.querySelector("#contact-modal");

    if (!modal) return;

    const modalContainer = modal.querySelector(".modal-container");
    const modalCloseButtons = modal.querySelectorAll(
        '[data-modal-close], .modal-close'
    );

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    let lastFocusedElement = null;
    let previousBodyOverflow = "";
    let previousBodyPaddingRight = "";

    const inertedElements = new Map();

    /*
    |--------------------------------------------------------------------------
    | Selectors
    |--------------------------------------------------------------------------
    */

    const getFocusableElements = () => {
        const selector = [
            "a[href]",
            "area[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "iframe",
            "object",
            "embed",
            "[contenteditable='true']",
            "[tabindex]:not([tabindex='-1'])"
        ].join(",");

        return Array.from(modal.querySelectorAll(selector)).filter(
            (element) => {
                const style = window.getComputedStyle(element);

                return (
                    style.display !== "none" &&
                    style.visibility !== "hidden" &&
                    element.getClientRects().length > 0
                );
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Modal State Helpers
    |--------------------------------------------------------------------------
    */

    const isModalOpen = () => {
        return modal.classList.contains("is-open");
    };

    const setInert = (element, value) => {
        if (!element) return;

        /*
        | Modern browsers
        */
        if ("inert" in element) {
            element.inert = value;
        }

        /*
        | Attribute fallback / compatibility
        */
        if (value) {
            element.setAttribute("inert", "");
        } else {
            element.removeAttribute("inert");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Background Inert
    |--------------------------------------------------------------------------
    */

    const getBackgroundElements = () => {
        return Array.from(document.body.children).filter((element) => {
            return (
                element !== modal &&
                element.tagName !== "SCRIPT" &&
                element.tagName !== "STYLE"
            );
        });
    };

    const disableBackgroundInteraction = () => {
        inertedElements.clear();

        const backgroundElements = getBackgroundElements();

        backgroundElements.forEach((element) => {
            const hadInertAttribute = element.hasAttribute("inert");
            const previousInertProperty =
                "inert" in element ? element.inert : hadInertAttribute;

            inertedElements.set(element, {
                hadInertAttribute,
                previousInertProperty
            });

            setInert(element, true);
        });
    };

    const restoreBackgroundInteraction = () => {
        inertedElements.forEach((state, element) => {
            if (!element || !element.isConnected) return;

            /*
            | Restore exactly to the state before modal opened.
            */
            if (state.hadInertAttribute) {
                if ("inert" in element) {
                    element.inert = state.previousInertProperty;
                }

                element.setAttribute("inert", "");
            } else {
                if ("inert" in element) {
                    element.inert = false;
                }

                element.removeAttribute("inert");
            }
        });

        inertedElements.clear();
    };

    /*
    |--------------------------------------------------------------------------
    | Body Scroll Lock
    |--------------------------------------------------------------------------
    */

    const lockBodyScroll = () => {
        previousBodyOverflow = document.body.style.overflow;
        previousBodyPaddingRight = document.body.style.paddingRight;

        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";

        /*
        | Prevent layout shift when scrollbar disappears.
        */
        if (scrollbarWidth > 0) {
            const currentPaddingRight = parseFloat(
                window.getComputedStyle(document.body).paddingRight
            ) || 0;

            document.body.style.paddingRight =
                `${currentPaddingRight + scrollbarWidth}px`;
        }
    };

    const unlockBodyScroll = () => {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.paddingRight = previousBodyPaddingRight;
    };

    /*
    |--------------------------------------------------------------------------
    | Focus Management
    |--------------------------------------------------------------------------
    */

    const focusFirstElement = () => {
        const focusableElements = getFocusableElements();

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
            return;
        }

        if (modalContainer) {
            modalContainer.setAttribute("tabindex", "-1");
            modalContainer.focus();
        }
    };

    const restoreFocus = () => {
        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus === "function" &&
            lastFocusedElement.isConnected
        ) {
            window.requestAnimationFrame(() => {
                lastFocusedElement.focus();
            });
        }

        lastFocusedElement = null;
    };

    /*
    |--------------------------------------------------------------------------
    | Open Modal
    |--------------------------------------------------------------------------
    */

    const openModal = () => {
        if (isModalOpen()) return;

        lastFocusedElement = document.activeElement;

        /*
        | Remove inert from modal itself.
        */
        setInert(modal, false);

        modal.classList.add("is-open");

        modal.setAttribute("aria-hidden", "false");

        /*
        | Lock background interaction and scrolling.
        */
        disableBackgroundInteraction();
        lockBodyScroll();

        /*
        | Move focus inside modal after it becomes visible.
        */
        window.requestAnimationFrame(() => {
            focusFirstElement();
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Close Modal
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        if (!isModalOpen()) return;

        modal.classList.remove("is-open");

        modal.setAttribute("aria-hidden", "true");

        /*
        | Restore background and body state.
        */
        restoreBackgroundInteraction();
        unlockBodyScroll();

        /*
        | Modal should be inert again while closed.
        */
        setInert(modal, true);

        /*
        | Restore focus to the element that opened the modal.
        */
        restoreFocus();
    };

    /*
    |--------------------------------------------------------------------------
    | Open Triggers
    |--------------------------------------------------------------------------
    */

    const modalOpenTriggers = document.querySelectorAll(
        '[data-modal-open="contact"], [data-modal-target="contact-modal"], [data-modal-target="#contact-modal"]'
    );

    modalOpenTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            openModal();
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Close Triggers
    |--------------------------------------------------------------------------
    */

    modalCloseButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Overlay Click
    |--------------------------------------------------------------------------
    */

    modal.addEventListener("click", (event) => {
        /*
        | Hanya klik langsung pada overlay yang menutup modal.
        | Klik di dalam .modal-container tidak akan menutup modal.
        */
        if (event.target === modal) {
            closeModal();
        }

        if (event.target.classList.contains("modal-overlay")) {
            closeModal();
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Escape Key + Focus Trap
    |--------------------------------------------------------------------------
    */

    document.addEventListener("keydown", (event) => {
        if (!isModalOpen()) return;

        /*
        | Escape
        */
        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }

        /*
        | Focus Trap
        */
        if (event.key !== "Tab") return;

        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
            event.preventDefault();

            if (modalContainer) {
                modalContainer.focus();
            }

            return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
            focusableElements[focusableElements.length - 1];

        /*
        | Shift + Tab dari elemen pertama
        | -> kembali ke elemen terakhir
        */
        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
            return;
        }

        /*
        | Tab dari elemen terakhir
        | -> kembali ke elemen pertama
        */
        if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Initial State
    |--------------------------------------------------------------------------
    */

    const initializeModal = () => {
        /*
        | Modal harus tertutup ketika halaman pertama kali dimuat.
        */
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        /*
        | Pastikan modal tidak dapat menerima focus ketika tertutup.
        */
        setInert(modal, true);

        /*
        | Jangan mengubah body jika modal memang sudah tertutup.
        */
    };

    initializeModal();
});