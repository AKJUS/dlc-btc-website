export class BitcoinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BitcoinError';
  }
}

export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerError';
  }
}

export class LeatherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeatherError';
  }
}

export class UnisatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnisatError';
  }
}

export class GemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GemError';
  }
}
