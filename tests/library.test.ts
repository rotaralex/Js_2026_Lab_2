import { expect } from 'chai';
import { Library } from '../src/services/Library';

interface Item {
  id: string;
  name: string;
}

describe('Library Generic Class Tests', () => {
  let lib: Library<Item>;

  beforeEach(() => {
    lib = new Library<Item>();
  });

  it('should add items to collection', () => {
    lib.add({ id: '1', name: 'Item 1' });
    expect(lib.getAll()).to.have.lengthOf(1);
  });

  it('should find items by id', () => {
    lib.add({ id: '10', name: 'Item 10' });
    const item = lib.findById('10');
    expect(item).to.exist;
    expect(item?.name).to.equal('Item 10');
  });

  it('should remove items by id', () => {
    lib.add({ id: '1', name: 'Item 1' });
    lib.remove('1');
    expect(lib.getAll()).to.be.empty;
  });
});