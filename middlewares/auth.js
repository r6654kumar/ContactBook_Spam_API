import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Please authenticate' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECTET_TOKEN);
    req.user = decoded;
    next();
  } 
  catch (err) {
    res.status(401).send({ error: 'Invalid token' });
  }
};
