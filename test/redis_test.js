var assert = require('assert');
var Dic = require('../lib/dic');
var dic = new Dic();
var cloudUrl = process.env.REDISCLOUD_URL;
dic.setRedisClient(cloudUrl);

if (process.env.REDISCLOOUD_URL) {


describe('redis', function() {
    it('enable redis', function() {
            assert.equal(true, dic.enableRedis);
    });
    it('get test', function(done) {
        dic.load('public/dic/dic.tsv', 'utf-8', function(entries) {
            done();
        });
    });
});

}
