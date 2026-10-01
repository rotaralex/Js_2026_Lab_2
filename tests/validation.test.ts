import { expect } from 'chai';
import { Validation } from '../src/utils/validators';

describe('Validation Namespace Tests', () => {
  it('should validate non-empty strings', () => {
    expect(Validation.isNotEmpty('hello')).to.be.true;
    expect(Validation.isNotEmpty('   ')).to.be.false;
  });

  it('should validate digits only', () => {
    expect(Validation.isOnlyDigits('12345')).to.be.true;
    expect(Validation.isOnlyDigits('123a45')).to.be.false;
  });

  it('should validate correct 4-digit publication years', () => {
    expect(Validation.isValidYear('2004')).to.be.true;
    expect(Validation.isValidYear('999')).to.be.false;
    expect(Validation.isValidYear('2999')).to.be.false;
  });
});