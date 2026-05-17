import bcryptjs from 'bcryptjs';
const { hash } = bcryptjs;
console.log('bcryptjs import successful');
const hashed = await hash('test', 10);
console.log('Hash:', hashed);
