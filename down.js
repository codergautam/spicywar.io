const express = require('express');
const app = express();

app.get('*', (req, res) => {
    res.send('Server is down, due to botting attacks<br>We will be back soon!<br><br>-CoderGautamYT');
});

app.listen(3000, () => {
    console.log('server is up on port 3000');
});
