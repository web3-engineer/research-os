import { Request, Response, NextFunction } from 'express';

export const zaeonGuard = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.headers['x-zaeon-user-id']; // O frontend passará o ID do usuário da sessão

    if (!authId) {
        return res.status(401).json({ error: "Não autorizado. User ID ausente." });
    }

    // No futuro, aqui validaremos o JWT do NextAuth
    (req as any).authenticatedUserId = authId;
    next();
}