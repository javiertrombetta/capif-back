declare namespace Express {
  interface Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any; // O especifica el tipo de `user` si lo conoces
  }
}
