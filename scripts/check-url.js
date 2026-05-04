const https = require('https');
https.get('https://res.cloudinary.com/duvhugzlq/image/upload/v1777890819/pantaukota/oayrwh1pajnrh9gchnid.jpg', (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
}).on('error', (e) => {
  console.error(e);
});
