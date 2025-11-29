function login(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const token = Buffer.from(email).toString('base64');
  return res.json({ token, email });
}

module.exports = {
  login,
};


