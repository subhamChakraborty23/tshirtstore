const cookieToken = (message,user, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  res.status(200).cookie("jwt", token, options).json({
    success: true,
    message: message,
    user,
    token,
  });
};

module.exports = cookieToken;
