
var fs = require('fs');
var async = require('async');
var url = require('url');
var redis = require('redis');

var Dic = function() {
    this.file = 'tmp.dic';
    this.charset = 'utf-8';
    this.entries = {};
    this.client = null;
    this.enableRedis = false;
};
Dic.prototype.setRedisClient = function(cloudUrl) {
    if (cloudUrl == undefined) {
         return;
    }
    var redisUrl = url.parse(cloudUrl);
    this.client = redis.createClient(redisUrl.port, redisUrl.hostname, {no_ready_check: true});
    var dic = this;
    this.enableRedis = true;
    this.client.auth(redisUrl.auth.split(':')[1]);
    this.client.on('error', function(err) {
        dic.enableRedis = false;
    });
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
        if (this.enableRedis) {
	    this.client.get(file, function(err, data) {
                var newEntries = JSON.parse(data);
                for (var x in newEntries) {
                    entries[x] = newEntries[x];
                }
            });
        }
	if (typeof callback === 'function') {
	    callback(entries);
	}
    });
}
Dic.prototype.totsv = function() {
   var data = '';
   for (x in this.entries) {
      data += x + '\t' + this.entries[x] + '\n';
   }
   return data;
}
Dic.prototype.save = function(callback) {
   var data = this.totsv();
   fs.writeFile(this.file, data, callback);
   if (this.enableRedis) {
      this.client.set(this.file, JSON.stringify(this.entries))
   }
}

Dic.prototype.put = function(key, val, callback) {
   this.entries[key] = val;
   this.save(callback); 
};
Dic.prototype.delete = function(key, callback) {
   delete this.entries[key];
   this.save(callback);
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
