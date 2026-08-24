/**
 * 404 Fallback Middleware
 * Catches all requests to endpoints that do not match any defined routes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Not Found — ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
