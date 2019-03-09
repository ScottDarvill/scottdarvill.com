
const express = require('express')
const path = require('path')
const app = express()
const crypto = require('crypto')
const mime = require('mime')
const multer = require("multer");
const favicon = require('serve-favicon');

const dotenv = require('dotenv');
dotenv.config();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname  + '/public/uploads'))
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
      });
    }
  });

const upload = multer({ storage: storage, onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  }, });

app.use(express.static(__dirname + '/public'))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', function (req, res) {
    res.render('index.ejs')
})

app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.get('/myexperiments', function (req, res) {
    res.render('myexperiments.ejs')
})


const ocr = require('./modules/ocr')
app.post('/LicensePlateIdentification', upload.single('imageToUpload'), async (req, res, next) => {

    ocr.LicensePlateIdentification(req, res, next)    
})

// Handle 404
app.use(function (error, res) {
    res.status(400);
    res.render('404.ejs', { title: '404: File Not Found', error: error });
});

// Handle 500
app.use(function (error, res) {
    res.status(500);
    res.render('500.ejs', { title: '500: Internal Server Error', error: error });
});

var port = process.env.PORT  || 8080;

app.listen(port, function () {
    console.log('scottdarvill.com has started')
})