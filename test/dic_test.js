var assert = require('assert');

var Dic = require('../lib/dic');

describe('Dic', function() {
    it('load', function(done) {
        var dic = new Dic();
        dic.load('public/dic/dic.tsv', 'utf-8', function(entries) {
            assert.equal('fuga', entries['hoge']);
            done();
        });
    });
    it('put', function(done) {
        var dic = new Dic();
        dic.load('public/dic/dic.tsv', 'utf-8', function(entries) {
            dic.put('aaa', 'bbb', function() {
                done();
            });
        });
    });
});
