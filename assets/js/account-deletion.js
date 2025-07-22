// Simple script to handle account deletion confirmation
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('deletion-form');
  const passwordField = document.getElementById('password');
  const confirmCheckbox = document.getElementById('confirm-deletion');
  const deleteButton = document.getElementById('delete-btn');
  const cancelButton = document.getElementById('cancel-btn');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  if (deleteButton) {
    deleteButton.addEventListener('click', function() {
      errorMessage.style.display = 'none';
      
      if (!passwordField.value) {
        errorMessage.textContent = 'Please enter your password';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (!confirmCheckbox.checked) {
        errorMessage.textContent = 'Please confirm that you understand the consequences';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Simulate account deletion
      deleteButton.disabled = true;
      deleteButton.innerHTML = '<span class="loading-spinner"></span> Deleting Account...';
      
      // Mock successful deletion after 2 seconds
      setTimeout(function() {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Redirect to home page after 3 seconds
        setTimeout(function() {
          window.location.href = '/group-wander-verse/';
        }, 3000);
      }, 2000);
    });
  }
  
  if (cancelButton) {
    cancelButton.addEventListener('click', function() {
      // Redirect back to profile
      window.location.href = '/group-wander-verse/';
    });
  }
}); 