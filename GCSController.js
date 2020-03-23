"use strict";

const {Storage} = require('@google-cloud/storage');
const {Readable} = require('stream');
const gulpif = require('gulp-if');
const zlib = require('zlib');

class GCSController {
    constructor(_projectId, _keyFilename, _bucketName) {
      this.strage = new Storage({ projectID: _projectId, keyFilename: _keyFilename});
      this.bucket = this.strage.bucket(_bucketName);
    }
    
    async fileExists (_filePath) {
      // async関数内でawaitと同時に使用しないと、判定処理などでは使用できない!!
      return this.bucket.file(_filePath).exists().then(function(exist) {
        if (exist[0]) {
          return true;
        } else {
          return false;
        }
      });
    }
    
    async getStream (_filePath, _contentType='auto', _encoding='utf8') {
      
      if (_contentType == 'auto') {
        // _filePathの拡張子からcontentTypeを判定
        switch(_filePath.split('.').pop().toLowerCase()) {
          case 'jpg': _contentType = 'image/jpeg'; break;
          case 'png': _contentType = 'image/png'; break;
          case 'gz': _contentType = 'application/zip'; break;
          default: _contentType = 'text/plain';
        }
      }
      
      // ストリームの書き出し先としての、gcsオブジェクトを取得
      let ws = this.bucket.file(_filePath).createWriteStream({
        metadata: {
          cacheControl: 'no-cache',
          contentType: _contentType,
        },
      });
  
      let rs = new Readable();
      
      // _encodingが意味を持つのは'text/plain'の場合のみ
      if (_contentType == 'text/plain') { rs.setEncoding(_encoding); }
      
      rs
        .pipe(gulpif(_contentType=='application/gzip', zlib.createGzip())) // 'application/gzip'の場合のみ、この行がパイプに加わる
        .pipe(ws)
        .on('error', e => {
            // log.error(util.format("%s: %s", e.name, e.message))
            console.log(`${e.name}: ${e.message}`);
        })
        .on('finish', () => {
            // log.debug('uploaded :' + _filePath)
            console.log(`uploaded: ${_filePath}`);
        })
  
      return rs;
    }
    
    async upload (_filePath, _data, _contentType='auto', _encoding='utf8') {
  
      if (await this.fileExists(_filePath)) {
        // log.warn(`${_filePath} is exists!`);
        console.log(`${_filePath} is exists!`);
      } else {
        let rs = await this.getStream(_filePath, _contentType, _encoding);
        rs.push(_data);
        rs.push(null);
      }
    }
  }
  // exports.GCSController = GCSController;
  module.exports = GCSController;