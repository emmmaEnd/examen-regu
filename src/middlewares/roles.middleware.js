// src/middlewares/roles.middleware.js
export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ message: 'No permisos' });
    }

    next();
  };
}
