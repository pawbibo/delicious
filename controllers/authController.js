const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // check if user is authenticated
  if (req.isAuthenticated()) {
    next(); // continue, user is logged in
    return;
  }

  req.flash('error', 'Sorry, you need to be logged in to do that');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // see if user email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }
  // set tokens and expiry to their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // send email with token
  const resetUrl = `https://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed the password reset link ${resetUrl}`);
  // redirect to the login page
  res.redirect('/login');

};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or expired');
    res.redirect('/login');
  }

  // if there is a user
  res.render('reset', { title: 'Reset your password' });
};