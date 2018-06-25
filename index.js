const jwt = require('jsonwebtoken');
const github = require('@octokit/rest')();

process.on('unhandledRejection', error => {
    console.log(error);
    process.exit(1)
});

async function run() {
    const key = Buffer.from(process.env['APP_PRIVATE_KEY'], 'base64').toString('binary');
    const payload = {
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        iss: 14028
    };

    const token = jwt.sign(payload, key, {algorithm: 'RS256'});
    github.authenticate({type: 'app', token});

    const res = await github.apps.createInstallationToken({installation_id: '220321'});
    github.authenticate({type: 'token', token: res.data.token});
}

run();
