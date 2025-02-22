
document.addEventListener('DOMContentLoaded', () => {

    //Select all task cards marked with data-bs-toggle="modal";
    const modalLinks = document.querySelectorAll('a[data-bs-toggle="modal"]');

    modalLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          // Extraxt task-specific information from the clicked card attributes.
          const task_id = event.currentTarget.getAttribute('data-taskID');
          const task_name = event.currentTarget.getAttribute('data-task_name');
          const task_desc = event.currentTarget.getAttribute('data-task_desc');
          const task_dueDate = event.currentTarget.getAttribute('data-dueDate');
          const task_cat = event.currentTarget.getAttribute('data-cat');
          const task_star = event.currentTarget.getAttribute('data-star');
          const task_status_id = event.currentTarget.getAttribute('data-task_status_id');
          
          
          // Populate modal with task specific attributes 
          document.getElementById('modalTaskID').value = task_id;
          document.getElementById('modalTitle').value = task_name;
          document.getElementById('modalDesc').value = task_desc;
          document.getElementById('modalDate').value = formatDateforHTML(new Date(task_dueDate));
          document.getElementById('modalCat').value = task_cat;
          document.getElementById('btnradio'+task_star).checked = true;
          document.getElementById('delete_button').setAttribute('href', `/delete/${task_id}`);
          document.getElementById('complete_button').setAttribute('href', `/complete/${task_id}`);
          if(task_status_id == 1) {
            document.getElementById('delete_button').classList.add("disabled");

          }  

        });
      });
});

function formatDateforHTML(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits for day
    
    return `${year}-${month}-${day}`;
  }