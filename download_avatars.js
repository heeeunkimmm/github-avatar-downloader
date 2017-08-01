var env = require('dotenv').config();

var request = require('request');
var fs = require('fs');
var GITHUB_USER = process.env.GITHUB_USER;
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var owner = process.argv[2];
var repo = process.argv[3];



function getRepoContributors(repoOwner, repoName, cb) {
  var requestURL = 'https://' + GITHUB_USER + ':' + GITHUB_TOKEN + '@api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors';
  var options = {
    url: requestURL,
    headers: {
      'User-Agent': 'request'
    }
  };

  request(options, function (error, response, body) {
    if (error) { throw err; }
    console.log('statusCode:', response && response.statusCode);

    var parsed = JSON.parse(body);
    cb(error, parsed);
  });
}

function downloadImageByURL(url, filePath) {
  var extension;
  request.get(url)
    .on('error', function(err) {
      console.log(err);
    }).on('response', function (response) {
      // We get the content type from the HTTP response headers
      extension = response.headers['content-type'];
      // Extract the extension
      extension = extension.slice(extension.indexOf('/') + 1);
    })
    .pipe(fs.createWriteStream(filePath).on('close', function renameFile(event) {
      var newPath = filePath + '.' + extension;
      fs.rename(filePath, newPath, function () {
        console.log(filePath, 'has been renamed to', newPath);
      });
    }));
}


getRepoContributors(owner, repo, function(err, result) {
  result.forEach(function(item) {
    console.log(item.avatar_url);
    downloadImageByURL(item.avatar_url, 'avatars/' + item.login);
  });
  // console.log("Errors:", err);
  // console.log("Result:", result);
});

