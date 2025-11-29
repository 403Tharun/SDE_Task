module.exports = function authMock(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const email = req.header('X-User-Email');
  if (!email) {
    return res.status(401).json({ message: 'Missing X-User-Email header' });
  }

  req.user = { email };
  return next();
};

