const {GCSController} = require('ym-gcs-controller');

require('dotenv').config();

// GCP関連の設定情報
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_KEYFILE = process.env.GOOGLE_KEYFILE;
const GCS_BUCKET = process.env.GCS_BUCKET;

console.log("start");

const gcs = new GCSController(
  GOOGLE_PROJECT_ID,
  GOOGLE_KEYFILE,
  GCS_BUCKET
);

let filename = 'sample.txt';
if (gcs.fileExists(filename)) {
  console.log(`${filename} is exists.`);
} else {
  console.log(`${filename} is not exists.`);
}