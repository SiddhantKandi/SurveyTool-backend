//Check for admin
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: "Forbidden: Access not granted " });
    }
    next();
};