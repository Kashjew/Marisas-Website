// editPost.js

document.addEventListener('DOMContentLoaded', function () {
    window.editPost = function(postId) {
        const createPostModal = document.getElementById('createPostModal');
        const createPostForm = document.getElementById('createPostForm');

        if (createPostModal && postId) {
            createPostModal.style.display = "block";
            
            fetch(`/admin/edit-post/${postId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        populatePostForm(data.post);
                        createPostForm.dataset.editMode = true;
                        createPostForm.dataset.postId = postId;
                    } else {
                        console.error('Error fetching post data:', data.message);
                    }
                })
                .catch(error => console.error('Error fetching post data:', error));
        }
    };

    function populatePostForm(post) {
        const createPostForm = document.getElementById("createPostForm");
        if (createPostForm) {
            createPostForm.title.value = post.title || "";
            createPostForm.content.value = post.content || "";
            createPostForm.querySelector('#tagInput').value = post.tags.join(", ") || "";
            createPostForm.instagramLink.value = post.instagramLink || "";
            createPostForm.prepTime.value = post.recipe?.prepTime || "";
            createPostForm.cookTime.value = post.recipe?.cookTime || "";
            createPostForm.servings.value = post.recipe?.servings || "";
            createPostForm.ingredients.value = post.recipe?.ingredients?.join("\n") || "";
            createPostForm.steps.value = post.recipe?.steps?.join("\n") || "";
            createPostForm.notes.value = post.recipe?.notes || "";
        }
    }
});
