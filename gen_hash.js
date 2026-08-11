const https = require('https');
https.get('https://unpkg.com/bcryptjs@2.4.3/dist/bcrypt.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const sandbox = { window: {}, module: {}, exports: {} };
    require('vm').runInNewContext(data, sandbox);
    const bcrypt = sandbox.window.dcodeIO ? sandbox.window.dcodeIO.bcrypt : sandbox.window.bcrypt;
    console.log('HASH=' + bcrypt.hashSync('haideradmin', 10));
  });
});
