var assert = require('assert');
var async = require('async');

var MyClass = function(name) {
   this.i = -1;
   this.name = name;
};
MyClass.prototype.myfunc = function(callback) {
    i = 1;
    callback(null, i);
}
var callfunc = function(callback, data) {
    var i = 2;
    callback(null, i);
}

describe('callback test', function() {
    it('scope test', function(done) {
        var myclass = new MyClass();
        var i = -2;
        myclass.myfunc(function() {
            callfunc(function() {
                assert.equal(-2, i);
                done();
            }); 
        });
    });
    it('scope test2', function(done) {
        var myclass = new MyClass();
        i = -2;
        myclass.myfunc(function() {
            callfunc(function() {
                assert.equal(1, i);
                done();
            });
        });
    });
    it('scope test3', function(done) {
        var myclass = new MyClass('myclass');
        myclass.myfunc(function() {
            assert.equal(undefined, this.name);
            assert.equal('myclass', myclass.name);
            done();
        });
    });
    it('scope test4', function(done) {
        var myclass = new MyClass('myclass');
        var callback = function() {
            assert.equal('myclass', this.name);
            done();
        };
        callback = callback.bind(myclass);
        myclass.myfunc(callback);
    });
    it('async test', function(done) {
        var myclass = new MyClass();
        var i = -2;
        async.series([
            function(callback) {
                myclass.myfunc(callback);
            },
            function(callback) {
                callfunc(callback, 3);
            }
        ], function(err, results) {
            assert.equal(-2, i);
            assert.equal(1, results[0]);
            assert.equal(2, results[1]);
            done();
        });
    });
});
