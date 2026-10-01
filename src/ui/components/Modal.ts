export class Modal {
  static showPrompt(title: string, onConfirm: (value: string) => void): void {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fade show';

    const modal = document.createElement('div');
    modal.className = 'modal fade show d-block';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close close-btn"></button>
          </div>
          <div class="modal-body">
            <input type="text" id="modal-input" class="form-control" placeholder="ID користувача">
            <div id="modal-err" class="text-danger mt-1 small"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary close-btn">Скасувати</button>
            <button type="button" class="btn btn-primary" id="modal-submit">Зберегти</button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      modal.remove();
      modalBackdrop.remove();
    };

    modal.querySelectorAll('.close-btn').forEach((btn) => btn.addEventListener('click', close));

    modal.querySelector('#modal-submit')?.addEventListener('click', () => {
      const val = (modal.querySelector('#modal-input') as HTMLInputElement).value;
      if (!val) {
        (modal.querySelector('#modal-err') as HTMLElement).innerText = 'Поле не може бути пустим';
        return;
      }
      onConfirm(val);
      close();
    });

    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);
  }

  static showAlert(title: string, message: string): void {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fade show';

    const modal = document.createElement('div');
    modal.className = 'modal fade show d-block';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close close-btn"></button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary close-btn">Зрозуміло!</button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      modal.remove();
      modalBackdrop.remove();
    };

    modal.querySelectorAll('.close-btn').forEach((btn) => btn.addEventListener('click', close));
    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);
  }
}