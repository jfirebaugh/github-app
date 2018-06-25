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

    await github.checks.create({
        owner: 'jfirebaugh',
        repo: 'github-app',
        name: 'test-check',
        head_branch: process.env['CIRCLE_BRANCH'],
        head_sha: process.env['CIRCLE_SHA1'],
        status: 'completed',
        conclusion: 'success',
        completed_at: new Date().toISOString(),
        output: {
            title: 'This is the output title',
            summary: 'Congratulations @jfirebaugh, your check completed successfully',
            text: 'This is more text. It also supports markdown.\n* A\n* B\n* C'
        }
    });
}

run();
