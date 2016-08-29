var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
}


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: 'clinicair.web@gmail.com', // Your email id
      pass: '6!appleNUTcoffee!9' // Your password
  }
});

app.get('/', function(request, response) {
  response.render('pages/home');
});

app.get('/home', function(request, response) {
  response.render('pages/home');
});

app.get('/selling', function(request, response) {
  response.render('pages/selling');
});

app.get('/cleaning', function(request, response) {
  response.render('pages/cleaning');
});

app.get('/fixing', function(request, response) {
  response.render('pages/fixing');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/contact', function(request, response) {
  response.render('pages/contact');
});

app.post('/sendemail', function(request, response) {
  var firstName = removeTags(request.body.firstname);
  var lastName  = removeTags(request.body.lastname);
  var telephone = removeTags(request.body.telephone);
  var email     = removeTags(request.body.email);
  var query     = removeTags(request.body.query);
  // setup e-mail data with unicode symbols
  var textBody = firstName + " " + lastName + "\n" + "Tel : " + telephone + "\n" + "Email : " + email + "\n\n" + query;
  var mailOptions = {
      from: '"Clinic Air Web" <gtconan@gmail.com>', // sender address
      to: 'kittikorn.a@gmail.com', // list of receivers
      subject: 'สอบถาม', // Subject line
      text: textBody// text
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
    response.redirect('/home')
  });
});

app.get('/times', function(request, response) {
  var result = '';
  var times = process.env.TIMES || 5;
  for (var i = 0; i < times; i ++) {
    result += i + ' ';
  }
  response.send(result);
});

var pg = require('pg');

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
      {
        console.error(err);
        response.send("Error " + err);
      }
      else
      {
        response.render('pages/db', {
          results: result.rows
        });
      }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
