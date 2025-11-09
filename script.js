document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipe-form');
    const recipeList = document.getElementById('recipe-list');
    const searchBox = document.getElementById('search-box');
    const recipeModal = document.getElementById('recipe-modal');
    const closeModal = document.querySelector('.close-button');
    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let editingRecipeId = null;

    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('recipe-title').value;
        const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(item => item.trim());
        const instructions = document.getElementById('recipe-instructions').value;
        const imageInput = document.getElementById('recipe-image');
        const imageFile = imageInput.files[0];
        const recipeId = document.getElementById('recipe-id').value;

        const handleImage = (imageData) => {
            if (recipeId) {
                // Update existing recipe
                const recipe = recipes.find(r => r.id == recipeId);
                recipe.title = title;
                recipe.ingredients = ingredients;
                recipe.instructions = instructions;
                if (imageData) {
                    recipe.image = imageData;
                }
            } else {
                // Add new recipe
                const newRecipe = {
                    id: Date.now(),
                    title,
                    ingredients,
                    instructions,
                    image: imageData
                };
                recipes.push(newRecipe);
            }

            saveAndRender();
            recipeForm.reset();
            document.getElementById('recipe-id').value = '';
            recipeForm.querySelector('button').textContent = 'Add Recipe';
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleImage(event.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            const recipe = recipeId ? recipes.find(r => r.id == recipeId) : null;
            handleImage(recipe ? recipe.image : 'https://via.placeholder.com/200x150.png?text=No+Image');
        }
    });

    searchBox.addEventListener('input', () => {
        renderRecipes();
    });

    closeModal.addEventListener('click', () => {
        recipeModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == recipeModal) {
            recipeModal.style.display = 'none';
        }
    });

    function renderRecipes() {
        recipeList.innerHTML = '';
        const searchTerm = searchBox.value.toLowerCase();
        const filteredRecipes = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.join(' ').toLowerCase().includes(searchTerm)
        );

        filteredRecipes.forEach(recipe => {
            const recipeItem = document.createElement('div');
            recipeItem.classList.add('recipe-item');
            recipeItem.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <div class="buttons">
                    <button class="view-button" data-id="${recipe.id}">View</button>
                    <button class="edit-button" data-id="${recipe.id}">Edit</button>
                    <button class="delete-button" data-id="${recipe.id}">Delete</button>
                </div>
            `;
            recipeList.appendChild(recipeItem);
        });

        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', viewRecipe);
        });
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', editRecipe);
        });
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', deleteRecipe);
        });
    }

    function viewRecipe(e) {
        const recipeId = e.target.dataset.id;
        const recipe = recipes.find(r => r.id == recipeId);

        document.getElementById('modal-title').textContent = recipe.title;
        document.getElementById('modal-image').src = recipe.image;
        document.getElementById('modal-ingredients').textContent = recipe.ingredients.join(', ');
        document.getElementById('modal-instructions').textContent = recipe.instructions;

        recipeModal.style.display = 'block';
    }

    function editRecipe(e) {
        const recipeId = e.target.dataset.id;
        const recipe = recipes.find(r => r.id == recipeId);

        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('recipe-title').value = recipe.title;
        document.getElementById('recipe-ingredients').value = recipe.ingredients.join(', ');
        document.getElementById('recipe-instructions').value = recipe.instructions;

        recipeForm.querySelector('button').textContent = 'Update Recipe';
        window.scrollTo(0, 0);
    }

    function deleteRecipe(e) {
        const recipeId = e.target.dataset.id;
        recipes = recipes.filter(r => r.id != recipeId);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('recipes', JSON.stringify(recipes));
        renderRecipes();
    }

    renderRecipes();
});
