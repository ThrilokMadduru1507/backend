const bcrypt = require('bcryptjs');

const password = 'password123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password hash for "password123":');
    console.log(hash);
  }
});