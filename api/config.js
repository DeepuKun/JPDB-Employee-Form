module.exports = (req, res) => {
  res.status(200).json({
    CONN_TOKEN: process.env.CONN_TOKEN || null,
    DB_NAME: process.env.DB_NAME || null,
    REL_NAME: process.env.REL_NAME || null,
    BASE_URL: process.env.BASE_URL || null
  });
};
