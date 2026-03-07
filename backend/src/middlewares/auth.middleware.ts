import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id']; // O frontend passará o ID do usuário da sessão

    if (!userId) {
        return res.status(401).json({ error: "Não autorizado. User ID ausente." });
    }

    // No futuro, aqui validaremos o JWT do NextAuth
    (req as any).userId = userId;
    next();
};