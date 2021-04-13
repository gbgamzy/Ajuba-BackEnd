const admin = require("firebase-admin");

const serviceAccount = require("../restaurant-ajuba-firebase-adminsdk-usxi9-4bc9b01423.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


module.exports.admin = admin