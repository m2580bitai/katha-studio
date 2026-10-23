import { nightLedger } from "./books/night-ledger/index.js";

export const proseBooks = [nightLedger];

export function bookById(id) {
  return proseBooks.find((b) => b.id === id) || null;
}

export function bookPdfPath(book) {
  return book.pdf;
}
