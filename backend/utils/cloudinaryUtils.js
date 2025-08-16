// const cloudinary = require("config/cloudinary"); // Import configured instance
// const streamifier = require("streamifier");

// const uploadToCloudinary = (fileBuffer, mimetype) => {
//   const resourceType = mimetype.includes("video") ? "video" : "image";

//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { resource_type: resourceType },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     streamifier.createReadStream(fileBuffer).pipe(uploadStream);
//   });
// };

// module.exports = { uploadToCloudinary };
