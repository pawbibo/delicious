exports.loginForm = (req, res) => {
  res.render('login', { title: 'login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};