declare global {
  namespace Express {
    interface Request {
      metadata?: {
        user?: { id: string };
      };
    }
  }
}

export {};
