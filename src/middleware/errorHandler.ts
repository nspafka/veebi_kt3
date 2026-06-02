import { Request, Response, NextFunction } from 'express';

// Kohandatud vea klass — võimaldab HTTP staatuskoodi kaasa anda
export class AppError extends Error {
  // HTTP staatuskood mis saadetakse kliendile
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Vajalik TypeScript'is Error klassi laiendamisel
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Vigase päringu keha töötlemine — Express saadab selle vea kui JSON on vigane
interface SyntaxErrorWithBody extends SyntaxError {
  body?: unknown;
}

// Peamine veatöötleja middleware — peab olema 4 parameetriga et Express tunneks selle ära
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Kui tegemist on JSON süntaksiveaga (nt vigane päringu keha)
  if (err instanceof SyntaxError && (err as SyntaxErrorWithBody).body !== undefined) {
    res.status(400).json({
      error: 'Vigane JSON formaat',
      details: [{ field: 'body', message: 'Päringu keha ei ole kehtiv JSON' }],
    });
    return;
  }

  // Kui tegemist on meie enda AppError klassiga — kasutame seatud staatuskoodi
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Kõik muud ootamatud vead — 500 sisemine serveri viga
  // Tootmiskeskkonnas ei näita me detaile turvalisuse kaalutlustel
  console.error('Ootamatu viga:', err);
  res.status(500).json({ error: 'Sisemine serveri viga' });
}

// 404 middleware — käivitatakse kui ühtegi marsruuti ei leitud
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Marsruuti ei leitud: ${req.method} ${req.originalUrl}`,
  });
}
