const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

const isPhone = (input) => {
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(input);
};

module.exports = {
  isEmail,
  isPhone,
};