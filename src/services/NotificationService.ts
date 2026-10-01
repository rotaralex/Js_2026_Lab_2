export class NotificationService {
  static showToast(message: string, isError: boolean = false): void {
    const toastContainer = document.getElementById('toast-container') || this.createContainer();
    const toast = document.createElement('div');
    toast.className = `alert ${isError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show shadow-sm`;
    toast.style.minWidth = '300px';
    toast.innerHTML = `
      <span>${message}</span>
      <button type="button" class="btn-close" aria-label="Close"></button>
    `;

    toast.querySelector('.btn-close')?.addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 200);
    }, 3500);
  }

  private static createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }
}