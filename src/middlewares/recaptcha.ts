import { Request, Response, NextFunction } from 'express';

const verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
    const recaptchaToken = req.body.recaptchaToken;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const threshold = parseFloat(process.env.RECAPTCHA_THRESHOLD || '0.5');

    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    if (!recaptchaToken) {
        return res.status(400).json({ message: "Token de reCAPTCHA faltante" });
    }

    if (!secretKey) {
        return res.status(500).json({ message: "Error en la validación reCAPTCHA" });
    }

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: secretKey,
                response: recaptchaToken
            })
        });

        const data = await response.json();

        if (!data.success) {     
            return res.status(403).json({ message: "Fallo la verificación de reCAPTCHA" });
        }

        if (data.score < threshold) {    
            return res.status(403).json({ message: "Puntuación de reCAPTCHA demasiado baja" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Error al verificar reCAPTCHA" });
    }
};

export default verifyRecaptcha;