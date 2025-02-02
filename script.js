let addMessage = document.querySelector('.message');
let addButton = document.querySelector('.add');
let todo = document.querySelector('.todo');

let todoList = []; 

addButton.addEventListener('click', addTask);

async function addTask() {
    if (addMessage.value) { 
        let newTodo = { 
            description: addMessage.value, 
            status: 0 
        };

        todoList.push(newTodo); 

        await sendTaskToServer(newTodo);

        addMessage.value = ''; 
    }
}

async function sendTaskToServer(task) {
    try {
        let response = await fetch('http://localhost:5299/api/Task/Add', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении задачи');
        }

        fetchTasks(); 

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function editTask(index) {
    let item = todo.querySelector(`li[data-index="${index}"]`);
    let taskText = item.querySelector('.task-text');
    let taskInput = item.querySelector('.task-input');

    taskText.style.display = 'none';
    taskInput.style.display = 'inline';
    taskInput.focus();

    taskInput.addEventListener('keyup', async function(event) {
        if (event.key === 'Enter') {
            let newDescription = this.value.trim();
            if (newDescription.length > 0) {
                todoList[index].description = newDescription;
                await sendEditTaskToServers(todoList[index]);
                displayMessages(); 
            } else {
                // Показываем ошибку, если новое описание пустое
                alert('Пожалуйста, введите хотя бы один символ.');
            }
        }
    });
}

async function sendEditTaskToServers(task) {
    try {
        const response = await fetch('http://localhost:5299/api/Task/Edit', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении задачи');
        }
        await fetchTasks();
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function deleteTask(index) {
    let taskId = todoList[index].id;
    todoList.splice(index, 1);
    await deleteTaskToServers(taskId);
    displayMessages();
}

async function deleteTaskToServers(taskId) {
    try {
        const response = await fetch(`http://localhost:5299/api/Task/Delete/${taskId}`, { // Используем DELETE и правильный URL
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении задачи');
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function changeTaskStatus(index, checked) {
    const taskId = todoList[index].id;
    const status = checked ? 'Completed' : 'Not_Completed';

    try {
        const response = await fetch(`http://localhost:5299/api/Task/ChangeStatus?id=${taskId}&status=${status}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при изменении статуса задачи');
        }

        // Обновляем локальный список задач
        todoList[index].status = status;
        displayMessages();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function fetchTasks() {
    try {
        let response = await fetch('http://localhost:5299/api/Task/Get', { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении задач');
        }

        const data = await response.json();
        todoList = data; 
        displayMessages(); 
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function displayMessages() {
    let displayMessage = '';
    todoList.forEach(function(item, i){
        displayMessage += itemTemplate(i, item.description, item.status === 'Not_Completed' ? false : true);
    });
    todo.innerHTML = displayMessage;

    let checkboxes = document.querySelectorAll('.todo input[type="checkbox"]');
    checkboxes.forEach(function(checkbox, index) {
        checkbox.checked = todoList[index].status === 'Completed';
        checkbox.addEventListener('change', function() {
            changeTaskStatus(index, checkbox.checked);
        });
    });
}

function itemTemplate(index, todoText, checked) {
    return `
        <li data-index="${index}">
            <input type='checkbox' id='item_${index}' ${checked ? 'checked' : ''}>
            <label for='item_${index}' class="task-text ${checked ? 'completed' : ''}">${todoText}</label>
            <input type="text" class="task-input" value="${todoText}" style="display: none;">
            <div class="buttons_for_task">
                <button class="delete-btn buttons_for_task" onclick="deleteTask(${index})">Удалить</button>
                <button class="edit-btn buttons_for_task" onclick="editTask(${index})">Редактировать</button>
            </div>
        </li>
    `;
}

fetchTasks();