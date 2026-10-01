import { IBook } from './interfaces/IBook';

export class Book implements IBook {
  constructor(
    public id: string,
    public title: string,
    public author: string,
    public year: number,
    public isBorrowed: boolean = false,
    public borrowedByUserId?: string,
  ) {}

  borrow(userId: string): void {
    this.isBorrowed = true;
    this.borrowedByUserId = userId;
  }

  returnBook(): void {
    this.isBorrowed = false;
    this.borrowedByUserId = undefined;
  }
}