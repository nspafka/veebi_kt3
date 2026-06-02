import { Request, Response, NextFunction } from 'express';

// Mähib async marsruudi käsitleja try/catch plokki
// Kõik visatud vead edastatakse automaatselt Express'i veatöötlejale
export function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };
}
