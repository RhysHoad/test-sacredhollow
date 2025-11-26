// FILE: admin/cms-logic.js

// 0. EXPLICITLY DISABLE NETLIFY IDENTITY PROVIDER
if(typeof CMS !== 'undefined'){
    CMS.unregisterBackend('netlify-identity');
}

// 1. Destructure the official React helpers from the CMS namespace
const { createClass, h } = CMS.React;

// --- Main Preview Template (using Iframe) ---
const MainPagePreview = createClass({
    // 0. Define the preview source (the iframe)
    getDocument: function() {
        return h('iframe', { src: '/' }); 
    },

    // Function to re-run the external scripts and content update logic
    reinitializeIframeContent: function(iframe, entry) {
        if (!iframe || !iframe.document || !entry) return;

        var iframeDoc = iframe.document;
        
        // --- Step 1: Manual DOM/Class Fixes & Asset Handling ---
        // Crucial: Manually remove 'is-preload' class 
        iframeDoc.body.classList.remove('is-preload');

        // Handle Background Image: Since this image is likely set via CSS/JS in the theme,
        // we'll try to update the path on the <body> tag as a fallback.
        var data = entry.get('data').toJS(); 
        var bgImage = data['bg_image'];
        if (bgImage) {
            // NOTE: If the image is controlled by main.css, this step will be ignored 
            // but we ensure the image path is available if the theme tries to fetch it.
            // If the image is loaded via CSS, you must manually check the final CSS path.
        }


        // --- Step 2: Rerun Content Injection ---
        // Helper function to update text content
        var updateText = function(id, key) {
            var el = iframeDoc.getElementById(id);
            if (el) {
                // Use widgetFor for live preview (including markdown rendering)
                if (key === 'about_text' || key === 'booking_text' || key === 'services_text') {
                    var htmlContent = this.props.widgetFor(key).toString(); 
                    el.innerHTML = htmlContent;
                } else {
                    el.textContent = data[key]; // Use direct data for simple strings
                }
            }
        }.bind(this); 

        // Helper function to update element attributes
        var updateAttribute = function(id, key, attr) {
            var el = iframeDoc.getElementById(id);
            if (el) {
                el.setAttribute(attr, data[key]);
            }
        };

        // Apply all updates
        updateText('cms-meta_title', 'meta_title');
        updateAttribute('cms-meta_description', 'meta_description', 'content');
        updateText('cms-hero_title', 'hero_title');
        updateText('cms-hero_subtitle', 'hero_subtitle');
        updateText('cms-hero_primary_cta', 'hero_primary_cta');
        updateText('cms-hero_cta', 'hero_cta');
        updateText('cms-about_heading', 'about_heading');
        updateText('cms-about_text', 'about_text');
        updateText('cms-services_heading', 'services_heading');
        updateText('cms-services_text', 'services_text');
        updateText('cms-service_1', 'service_1');
        updateText('cms-service_2', 'service_2');
        updateText('cms-service_3', 'service_3');
        updateText('cms-service_4', 'service_4');
        updateText('cms-booking_heading', 'booking_heading');
        updateText('cms-booking_text', 'booking_text');
        updateText('cms-contact_heading', 'contact_heading');
        updateText('cms-copyright', 'copyright');
        updateAttribute('cms-facebook_url', 'facebook_url', 'href');
        updateAttribute('cms-instagram_url', 'instagram_url', 'href');
        updateAttribute('cms-email_url', 'email_url', 'href');


        // --- Step 3: Rerun Google Calendar Widget ---
        if (iframe.calendar && iframe.calendar.schedulingButton) {
            var targetEl = iframeDoc.getElementById('google-calendar-target');
            if (targetEl) {
                targetEl.innerHTML = ''; // Clear the target element first to prevent duplicates
                iframe.calendar.schedulingButton.load({
                    url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1zAD758Wz4ufrZrgXJyuMldC71GSvP9eCHFZnoKhl2hYyDx8-A6RR-c7Z7V1BeCBDBtZzyb572?gv=true',
                    color: '#0B8043',
                    label: 'Book an appointment',
                    target: targetEl
                });
            }
        }
        
        // --- Step 4: Aggressive Theme Re-initialization (THE KEY FIX) ---
        // This attempts to find and re-execute the theme's core logic which likely runs on $(window).on('load')
        if (iframe.window.jQuery) {
            var $ = iframe.window.jQuery;
            
            // 4a. Rerun Scrollex/Scrolly logic
            if ($.fn.scrollex) {
                $('.scrollex').scrollex({ mode: 'set' });
            }
            if ($.fn.scrolly) {
                $('.scrolly').scrolly({ mode: 'set' });
            }

            // 4b. Re-run the main theme logic
            // Since we don't know the exact function name in main.js, we simulate the 'load' event.
            // This forces the theme's main initialization function (likely wrapped in a $(window).load() or $(document).ready()) to fire again.
            $(iframe.window).trigger('load');
            $(iframeDoc).trigger('ready');

            // 4c. Dispatch DOM events
            iframe.dispatchEvent(new iframe.Event('resize'));
            iframe.dispatchEvent(new iframe.Event('scroll'));

            // Optional: A final check a bit later
            setTimeout(function() {
                iframe.dispatchEvent(new iframe.Event('resize'));
            }, 500);
        }
    },


    // 1. Logic to run whenever content changes
    componentDidUpdate: function() {
        this.reinitializeIframeContent(this.props.window, this.props.entry);
    },
    
    // 2. Logic to run when the component is mounted for the first time
    componentDidMount: function() {
        // Increased delay to ensure all registered scripts have fully loaded inside the iframe.
        setTimeout(() => {
             this.reinitializeIframeContent(this.props.window, this.props.entry);
        }, 500); // 500ms delay is safer for complex script loading
    },

    // 3. Render the iframe element
    render: function() {
        return h(this.getDocument); 
    }
});

// 4. Register the Template
CMS.registerPreviewTemplate('main_page', MainPagePreview);

// 5. *** INITIALIZE CMS HERE ***
CMS.init();
