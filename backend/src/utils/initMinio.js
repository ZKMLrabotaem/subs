import s3 from "./s3Client.js";

export async function initMinio() {
    try {
        await new Promise((resolve, reject) => {
            s3.createBucket({ Bucket: "media" }, (err, data) => {
                if (err) {
                    if (err.code === "BucketAlreadyOwnedByYou") return resolve();
                    return reject(err);
                }
                resolve(data);
            });
        });

        console.log("MinIO bucket 'media' created");
    } catch (err) {
        console.error("Error creating MinIO bucket:", err);
    }
}
