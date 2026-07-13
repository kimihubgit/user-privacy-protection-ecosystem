const url = 'http://localhost:8082/api/check-breach/email?q=vkhai2603%40gmail.com&lang=vi';

fetch(url)
.then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.json());
})
.catch(err => {
  console.error('Error:', err);
});
