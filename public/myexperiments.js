const multer = require("multer");


module.exports = {
  
  uploadImage: function (req, res, next) {
    const upload = multer({
      dest: __dirname + "/uploads"
      // you might also want to set some limits: https://github.com/expressjs/multer#limits
    });
    
      upload.single("file-upload" /* name attribute of <file> element in your form */),
      (req, res) => {
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, "./uploads/image.png");
    
        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
          fs.rename(tempPath, targetPath, err => {
            if (err) return handleError(err, res);
    
            res
              .status(200)
              .contentType("text/plain")
              .end("File uploaded!");
          });
        } else {
          fs.unlink(tempPath, err => {
            if (err) return handleError(err, res);
          });
        }
      }
      
  }
};



