import axios from 'axios';

(async () => {
  const response = await axios.post('http://localhost:5000/api/account/create', {
    firstName: 'Test',
    surname: 'User',
    email: 'test06@example.com',
    phoneNumber: '07039527869',
    dateOfBirth: '1995-04-10'
  });

  console.log('🎉 Response:', response.data);
})();