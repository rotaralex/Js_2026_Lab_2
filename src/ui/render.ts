import { Book } from '../models/Book';
import { User } from '../models/User';
import { Library } from '../services/Library';
import { Storage } from '../services/Storage';
import { Validation } from '../utils/validators';
import { Modal } from './components/Modal';
import { NotificationService } from '../services/NotificationService';

export class AppRenderer {
  private bookLib: Library<Book>;
  private userLib: Library<User>;

  private bookPage: number = 1;
  private itemsPerPage: number = 5;
  private bookSearchQuery: string = '';

  constructor() {
    const rawBooks = Storage.get<Book>('books');
    const rawUsers = Storage.get<User>('users');

    this.bookLib = new Library<Book>(
      rawBooks.map((b) => new Book(b.id, b.title, b.author, b.year, b.isBorrowed, b.borrowedByUserId)),
    );
    this.userLib = new Library<User>(
      rawUsers.map((u) => new User(u.id, u.name, u.email, u.borrowedBooksCount)),
    );
  }

  public init(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'container my-4';

    const header = document.createElement('h2');
    header.className = 'text-center mb-4 font-weight-bold';
    header.innerText = 'Система Управління Бібліотекою';
    container.appendChild(header);

    container.appendChild(this.createBookFormCard());
    container.appendChild(this.createUserFormCard());
    container.appendChild(this.createBookListCard());
    container.appendChild(this.createUserListCard());

    app.appendChild(container);
    this.renderBookList();
    this.renderUserList();
  }

  private createBookFormCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card mb-4 shadow-sm';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-3">Додати Книгу</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <input type="text" id="book-title" class="form-control" placeholder="Назва книги">
          </div>
          <div class="col-md-4">
            <input type="text" id="book-author" class="form-control" placeholder="Автор">
          </div>
          <div class="col-md-4">
            <input type="text" id="book-year" class="form-control" placeholder="Рік видання">
          </div>
        </div>
        <button id="add-book-btn" class="btn btn-success mt-3">Додати Книгу</button>
      </div>
    `;

    card.querySelector('#add-book-btn')?.addEventListener('click', () => {
      const title = (card.querySelector('#book-title') as HTMLInputElement).value;
      const author = (card.querySelector('#book-author') as HTMLInputElement).value;
      const year = (card.querySelector('#book-year') as HTMLInputElement).value;

      if (!Validation.isNotEmpty(title) || !Validation.isNotEmpty(author)) {
        NotificationService.showToast('Усі поля мають бути заповнені!', true);
        return;
      }
      if (!Validation.isValidYear(year)) {
        NotificationService.showToast('Рік має бути чотиризначним числом!', true);
        return;
      }

      const newBook = new Book(Date.now().toString(), title, author, parseInt(year, 10));
      this.bookLib.add(newBook);
      Storage.set('books', this.bookLib.getAll());
      this.renderBookList();
      NotificationService.showToast('Книгу успішно додано!');
      
      (card.querySelector('#book-title') as HTMLInputElement).value = '';
      (card.querySelector('#book-author') as HTMLInputElement).value = '';
      (card.querySelector('#book-year') as HTMLInputElement).value = '';
    });

    return card;
  }

  private createUserFormCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card mb-4 shadow-sm';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-3">Додати Користувача</h5>
        <div class="row g-3">
          <div class="col-md-4">
            <input type="text" id="user-id" class="form-control" placeholder="ID (тільки цифри)">
          </div>
          <div class="col-md-4">
            <input type="text" id="user-name" class="form-control" placeholder="Ім'я">
          </div>
          <div class="col-md-4">
            <input type="email" id="user-email" class="form-control" placeholder="Email">
          </div>
        </div>
        <button id="add-user-btn" class="btn btn-success mt-3">Додати Користувача</button>
      </div>
    `;

    card.querySelector('#add-user-btn')?.addEventListener('click', () => {
      const id = (card.querySelector('#user-id') as HTMLInputElement).value;
      const name = (card.querySelector('#user-name') as HTMLInputElement).value;
      const email = (card.querySelector('#user-email') as HTMLInputElement).value;

      if (!Validation.isNotEmpty(name) || !Validation.isNotEmpty(id)) {
        NotificationService.showToast('Заповніть обов’язкові поля!', true);
        return;
      }
      if (!Validation.isOnlyDigits(id)) {
        NotificationService.showToast('ID користувача має містити виключно цифри!', true);
        return;
      }
      if (!Validation.isValidEmail(email)) {
        NotificationService.showToast('Введіть коректний Email!', true);
        return;
      }
      if (this.userLib.findById(id)) {
        NotificationService.showToast('Користувач із таким ID вже існує!', true);
        return;
      }

      this.userLib.add(new User(id, name, email));
      Storage.set('users', this.userLib.getAll());
      this.renderUserList();
      NotificationService.showToast('Користувача зареєстровано!');

      (card.querySelector('#user-id') as HTMLInputElement).value = '';
      (card.querySelector('#user-name') as HTMLInputElement).value = '';
      (card.querySelector('#user-email') as HTMLInputElement).value = '';
    });

    return card;
  }

  private createBookListCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card mb-4 shadow-sm';
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Список Книг</h5>
          <input type="text" id="search-book" class="form-control w-25" placeholder="Пошук за автором або назвою">
        </div>
        <ul id="book-items-list" class="list-group mb-3"></ul>
        <div id="book-pagination" class="d-flex justify-content-center gap-2"></div>
      </div>
    `;

    card.querySelector('#search-book')?.addEventListener('input', (e) => {
      this.bookSearchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.bookPage = 1;
      this.renderBookList();
    });

    return card;
  }

  private createUserListCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card mb-4 shadow-sm';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-3">Список Користувачів</h5>
        <ul id="user-items-list" class="list-group"></ul>
      </div>
    `;
    return card;
  }

  private renderBookList(): void {
    const list = document.getElementById('book-items-list');
    const pagination = document.getElementById('book-pagination');
    if (!list || !pagination) return;

    list.innerHTML = '';
    pagination.innerHTML = '';

    const filtered = this.bookLib.find(
      (b) =>
        b.title.toLowerCase().includes(this.bookSearchQuery) ||
        b.author.toLowerCase().includes(this.bookSearchQuery),
    );

    const totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;
    const startIndex = (this.bookPage - 1) * this.itemsPerPage;
    const pageItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    if (pageItems.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted">Книг не знайдено</li>';
      return;
    }

    pageItems.forEach((book) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const user = book.borrowedByUserId ? this.userLib.findById(book.borrowedByUserId) : undefined;
      const statusText = book.isBorrowed
        ? `<span class="badge bg-warning text-dark">Позичено: ${user ? user.name : book.borrowedByUserId}</span>`
        : `<span class="badge bg-success">В наявності</span>`;

      li.innerHTML = `
        <div>
          <strong>${book.title}</strong> by ${book.author} (${book.year}) ${statusText}
        </div>
        <div class="d-flex gap-2">
          ${
            !book.isBorrowed
              ? `<button class="btn btn-sm btn-primary borrow-btn">Позичити</button>`
              : `<button class="btn btn-sm btn-secondary return-btn">Повернути</button>`
          }
          <button class="btn btn-sm btn-outline-danger delete-btn">Видалити</button>
        </div>
      `;

      li.querySelector('.borrow-btn')?.addEventListener('click', () => {
        Modal.showPrompt('Введіть ID користувача для позичення книги:', (userId) => {
          const u = this.userLib.findById(userId);
          if (!u) {
            Modal.showAlert('Помилка', 'Користувача з таким ID не існує!');
            return;
          }
          if (u.borrowedBooksCount >= 3) {
            Modal.showAlert('Обмеження!', 'Користувач не може позичити більше 3-х книг!');
            return;
          }

          book.borrow(userId);
          u.borrowedBooksCount += 1;
          this.saveAll();
          this.renderBookList();
          this.renderUserList();
          Modal.showAlert('Успіх', `${book.title} by ${book.author} (${book.year}) has been borrowed by ${u.id} ${u.name} (${u.email}).`);
        });
      });

      li.querySelector('.return-btn')?.addEventListener('click', () => {
        if (book.borrowedByUserId) {
          const u = this.userLib.findById(book.borrowedByUserId);
          if (u && u.borrowedBooksCount > 0) u.borrowedBooksCount -= 1;
        }
        book.returnBook();
        this.saveAll();
        this.renderBookList();
        this.renderUserList();
        Modal.showAlert('Повернення', `${book.title} by ${book.author} (${book.year}) has been returned.`);
      });

      li.querySelector('.delete-btn')?.addEventListener('click', () => {
        this.bookLib.remove(book.id);
        this.saveAll();
        this.renderBookList();
      });

      list.appendChild(li);
    });

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${i === this.bookPage ? 'btn-primary' : 'btn-outline-primary'}`;
      btn.innerText = i.toString();
      btn.addEventListener('click', () => {
        this.bookPage = i;
        this.renderBookList();
      });
      pagination.appendChild(btn);
    }
  }

  private renderUserList(): void {
    const list = document.getElementById('user-items-list');
    if (!list) return;
    list.innerHTML = '';

    const users = this.userLib.getAll();
    if (users.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted">Користувачів немає</li>';
      return;
    }

    users.forEach((user) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          ${user.id} <strong>${user.name}</strong> (${user.email}) - Позичено книг: <span class="badge bg-info text-dark">${user.borrowedBooksCount}/3</span>
        </div>
        <button class="btn btn-sm btn-outline-danger delete-user-btn">Видалити</button>
      `;

      li.querySelector('.delete-user-btn')?.addEventListener('click', () => {
        if (user.borrowedBooksCount > 0) {
          NotificationService.showToast('Не можна видалити користувача, який має неповернені книги!', true);
          return;
        }
        this.userLib.remove(user.id);
        this.saveAll();
        this.renderUserList();
      });

      list.appendChild(li);
    });
  }

  private saveAll(): void {
    Storage.set('books', this.bookLib.getAll());
    Storage.set('users', this.userLib.getAll());
  }
}