// tinyMCEEditorSetup.js

// Function to initialize TinyMCE editors with the desired configuration
function initializeTinyMCEEditors() {
    console.log('Initializing TinyMCE editors');
    
    // Fetch API key from a meta tag (for security and ease of access)
    const apiKey = document.querySelector('meta[name="tinymce-api-key"]').getAttribute('content');

    tinymce.init({
        selector: 'textarea', // Applies to all textarea elements
        apiKey: apiKey,
        plugins: [
            'anchor',          // Insert anchors/bookmarks
            'autolink',        // Automatically create links
            'charmap',         // Add special characters
            'codesample',      // Add code samples
            'emoticons',       // Use emoticons in content
            'image',           // Image upload and insertion
            'link',            // Insert/edit links
            'lists',           // Create styled lists
            'media',           // Embed media like audio/video
            'searchreplace',   // Search and replace within the editor
            'table',           // Table support
            'visualblocks',    // Visual block elements
            'wordcount'        // Display word count
        ],
        toolbar: 'undo redo | bold italic underline strikethrough | link image media | align lineheight | numlist bullist indent outdent | charmap emoticons | removeformat | searchreplace',
        height: 300,  // Set the default height for the editor
        menubar: false,
        setup: function (editor) {
            editor.on('change', function () {
                editor.save();  // Ensures content is saved into the textarea on change
            });
        }
    });
}
