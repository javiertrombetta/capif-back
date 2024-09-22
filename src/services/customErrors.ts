export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Solicitud incorrecta') {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
  }
}
