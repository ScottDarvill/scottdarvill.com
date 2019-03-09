const request = require('request');
const fs = require('fs');
const vm = require('vm')

var encryptionKey = process.env.AZURE_API_KEY

exports.LicensePlateIdentification = async (req, res, next) => {
    //Post image to Microsoft Text Recognition API
    try {
    postImageToOCRService(req, res).then(async function(OCRPromiseKey) {
        getOCRResponce(OCRPromiseKey,res).then(async function(OCRResponce) {
            var parsedOCRResponce = ParseOCRResponce(OCRResponce);
            getVehicleDetails(parsedOCRResponce.potentialLicencePlates).then(function(vehicle) {
            parsedOCRResponce.vehicle = vehicle;
            res.status(200).send(parsedOCRResponce);
            }, function(err) {
                res.status(200).send(parsedOCRResponce);
            })
        })
    })} catch(err){
        errorHandler(err, res)
    }
}

function ParseOCRResponce(OCRResponce) { 

    var OCRBody = (JSON.parse(OCRResponce.body))["recognitionResult"]["lines"]
    potentialLicencePlates = []
    textIdentified = []
    OCRBody.forEach(function(element) { 
        textIdentified.push(element.text);
        element.text = element.text.replace(/\s+/, "")
        if (element.text.match("^([0-9]+[A-Z]+|[A-Z]+[0-9]+)[0-9A-Z]*$") ) 
            { potentialLicencePlates.push(element.text) }
        })

    return { "textIdentified" : textIdentified , "potentialLicencePlates" : potentialLicencePlates } 
}

async function getOCRResponce(OCRPromiseKey, clientResponse) {
    console.log("Attempting to get OCR result from Microsoft");
    return new Promise(function(resolve, reject) {
        try {
            var getResultHeaders = {"Host": "westeurope.api.cognitive.microsoft.com", "Ocp-Apim-Subscription-Key": encryptionKey}
            var getRequest = {
                headers: getResultHeaders,
                url: "https://westeurope.api.cognitive.microsoft.com/vision/v2.0/textOperations/" + OCRPromiseKey
            }
            request.get(getRequest, function(err, resp, body) {
                if (err) {
                    errorHandler(err, clientResponse)
                    reject(err);
                } 
                if (resp.body != '{"status":"Running"}') {
                    resolve(resp);
                } else {
                    resolve(getOCRResponce(OCRPromiseKey, clientResponse));
                }
            })
        } catch (err) {
            errorHandler(err, res)
            reject(err);
        }
    })
}

async function postImageToOCRService(req, clientResponse) {
    return new Promise(function(resolve, reject) {
        try {
            console.log('Processing License Plate Identification Request');
            var postImageUrl = "https://westeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText/?mode=Printed"
            var postHeaders = {"Host": "westeurope.api.cognitive.microsoft.com", "Content-Type": "application/octet-stream", "Ocp-Apim-Subscription-Key": encryptionKey}
            var postData = { headers: postHeaders, url: postImageUrl, body: fs.createReadStream(req.file.path)} 
            
            request.post(postData, function(err, resp, body) {
              try { 
                if (err) {
                    errorHandler(err,clientResponse)
                    reject(err);
                } else {
                    var operationID = resp.headers['operation-location'].toString().split('/').pop()
                    resolve(operationID);
                } } catch (err) {
                    errorHandler(err, clientResponse)
                    reject(err);
                }
            })
        } catch (err) {
            errorHandler(err, clientResponse)
            reject(err);
        }
    })
}

function errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ 'error' : 'Something has gone wrong processing the image recognition, please try again'});
}

async function getVehicleDetails(potentialLicencePlates) {
   
    return new Promise(function(resolve, reject) {
        
            var rego = potentialLicencePlates[0];
            var url = "https://rc.dotnous.com/default.aspx?callback=callback&params=%7B%22service%22%3A%22mob%22%2C%22plate%22%3A%22" + rego + "%22%2C%22browse%22%3Afalse%2C%22e%22%3A%22n%22%7D"        
            request.get(url, function(err, resp, body) {
                try {
                if (err) {
                    reject(err);
                } else {
                    var jsonpSandbox = vm.createContext({callback: function(r){return r;}});
                    var myObject = vm.runInContext(body ,jsonpSandbox);
                    var myVehicle = myObject['vehicle'][0];
                    var vehicle = myVehicle.vehicle_year + " " + myVehicle.model;
                    resolve(vehicle);
                } 
            }
         catch (err) {
            reject(err);
        }})
    })
}