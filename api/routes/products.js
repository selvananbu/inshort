const express = require("express");
const router = express.Router();
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
// const mimeTypes = require('mimetypes');


var firebase = require('firebase');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname); 
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// const Product = require("../models/product");

router.get("/", (req, res, next) => {
  var userReference = firebase.database().ref('feed');
    userReference.on("value",
			  function(snapshot) {
          var allfeed = snapshot.val();
              const response = {
                    count: allfeed.length,
                    data:allfeed,
                    request: {
                                type: "GET",
                                url: "http://localhost:3000/products/"
                            }
          };
          res.status(200).json(response);
					userReference.off("value");
					}, 
			  function (errorObject) {
					res.status(500).send(errorObject)
			 });
});

router.post("/", upload.single('productImage'), (req, res, next) => {
  var userReference = firebase.database().ref('feed');
  var postRef = userReference.push();
  var key = postRef.key;
  var fileName = req.file.path;
  var newStorage = new Storage();
  var bucket = newStorage.bucket('inshort-335e8.appspot.com');
  bucket.upload(fileName,{destination:"uploads/"+fileName,predefinedAcl: 'publicRead'},(err,file) => {
      console.log('====================================');
      console.log("Uploaded");
      console.log('====================================');
  });

  var feed = {
        id: key,
        header: req.body.header, 
        content: req.body.content,
        image:req.file.path ,
        type: req.body.type
  }
        
  postRef.set(feed,function(error) {
          if (error) {
              console.log(error);
              res.status(500).json({
                error: error
              });
          } 
          else {
              res.status(201).json({
              message: "Created Feed successfully",
              createdFeed: {
                  name: feed.content,
                  price: feed.header,
                  id: feed.id,
                  type:feed.type,
                  request: {
                      type: 'GET',
                      url: "http://localhost:3000/products/" + feed.id
                  }
              }
            });
          }
      });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  var userReference = firebase.database().ref('feed/'+id);
    userReference.on("value",
			  function(snapshot) {
          var feed = snapshot.val();
          if(snapshot !== null){
            var data ={
              id:feed.id,
              header:feed.header,
              content:feed.content,
              image:feed.image,
              type:feed.type,
            }
            const response = {
              count: feed.length,
              data:data,
              request: {
                          type: "GET",
                          url: "http://localhost:3000/products/" + req.params.productId
                      }
                  };
                  res.status(200).json(response);
                  userReference.off("value");
          }
          }, 
          function (errorObject) {
            res.status(500).send(errorObject)
         })
  });
      

// router.patch("/:productId", (req, res, next) => {
//   const id = req.params.productId;
//   const updateOps = {};
//   for (const ops of req.body) {
//     updateOps[ops.propName] = ops.value;
//   }
//   Product.update({ _id: id }, { $set: updateOps })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//           message: 'Product updated',
//           request: {
//               type: 'GET',
//               url: 'http://localhost:3000/products/' + id
//           }
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

// router.delete("/:productId", (req, res, next) => {
//   const id = req.params.productId;
//   Product.remove({ _id: id })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//           message: 'Product deleted',
//           request: {
//               type: 'POST',
//               url: 'http://localhost:3000/products',
//               body: { name: 'String', price: 'Number' }
//           }
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

module.exports = router;
