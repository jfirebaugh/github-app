const jwt = require('jsonwebtoken');
const github = require('@octokit/rest')();

const CODE_CHECK_APP_ID = 17977;
const CODE_CHECK_APP_INSTALLATION_ID = 348102;

process.on('unhandledRejection', error => {
    console.log(error);
    process.exit(1)
});

async function run() {
    const key = Buffer.from(process.env['CODE_CHECK_PRIVATE_KEY'], 'base64').toString('binary');
    const payload = {
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        iss: CODE_CHECK_APP_ID
    };

    const token = jwt.sign(payload, key, { algorithm: 'RS256' });
    github.authenticate({type: 'app', token});

    const res = await github.apps.createInstallationToken({ installation_id: CODE_CHECK_APP_INSTALLATION_ID });
    github.authenticate({type: 'token', token: res.data.token});

    await github.checks.create({
        owner: 'kkaefer',
        repo: 'github-app',
        name: 'test-check',
        head_branch: process.env['CIRCLE_BRANCH'],
        head_sha: process.env['CIRCLE_SHA1'],
        conclusion: 'neutral',
        completed_at: new Date().toISOString(),
        output: {
            title: 'This is the output title',
            summary: 'Congratulations @kkaefer, your check completed successfully',
            annotations: [{
                path: 'index.js',
                start_line: 4,
                end_line: 5,
                annotation_level: 'notice',
                message: 'missing whitespace',
                title: 'asdf',
                raw_details: 'even more details',
            }]
        }
    });
}

run();
