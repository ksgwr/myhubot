
var fs = require('fs');
var async = require('async');

var Dic = function() {
    this.file = 'tmp.dic';
    this.charset = 'utf-8';
    this.entries = {};
};
Dic.prototype.load = function(file, charset, callback) {
    charset == typeof charset === 'undefined' ? 'utf-8' : charset;
    this.file = file;
    this.charset = charset;
    var entries = this.entries;
    fs.readFile(file, charset, function(err, data) {
	var text = data.toString();
	var lines = text.split(/\r\n|\r|\n/);
	for(var i=0;i<lines.length;i++) {
	    var line = lines[i];
	    var f = line.split(/\t/);
	    if (f.length > 1) {
	    	entries[f[0]] = f[1];
            }
	}
	if (typeof callback === 'function') {
	    callback(entries);
	}
    });
}
Dic.prototype.put = function(key, val, callback) {
   this.entries[key] = val;
   var data = '';
   for (x in this.entries) {
	data += x + '\t' + this.entries[x] + '\n';
   }
   fs.writeFile(this.file, data, callback);
};
Dic.prototype.delete = function(key, callback) {
   delete this.entries[key];
   var data = '';
   for (x in this.entries) {
        data += x + '\t' + this.entries[x] + '\n';
   }
   fs.writeFile(this.file, data, callback);
}
Dic.prototype.searchKeys = function(val) {
   var list = [];
   for (x in this.entries) {
      if (this.entries[x] == val) {
          list.push(x);
      }
   }
   return list;
}
module.exports = Dic;
