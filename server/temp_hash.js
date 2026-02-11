const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('boomer', 10);
console.log(hash);
