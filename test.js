var jason = require('./');
var expect = require('chai').expect;

describe('jason', function() {
  describe('get', function() {
    var fixture = {'test': 1};

    it('should get stuff by path', function() {
      expect(jason.get(fixture, '$.test')).to.equal(1);
    });

    it('returns a default when the path is empty', function() {
      expect(jason.get(fixture, '$.nothing', 2)).to.equal(2);
    });

    it('returns nothing when the path is empty and there is no default', function() {
      expect(jason.get(fixture, '$.nothing')).to.be.undefined;
    });
  });

  describe('set', function() {
    it('should set values that already exist', function() {
      var obj = {'test': 1};

      jason.set(obj, '$.test', 2);
      expect(obj.test).to.equal(2);
    });

    it('should create values that do not exist', function() {
      var obj = {};

      jason.set(obj, '$.test', 1);
      expect(obj.test).to.not.be.undefined;
    });

    it('should create nested values that do not exist', function() {
      var obj = {};

      jason.set(obj, '$.test1.test2', 1);
      expect(obj.test1.test2).to.equal(1);
    });

    it('should update nested values that it created', function() {
      var obj = {};

      jason.set(obj, '$.test1.test2', true);
      jason.set(obj, '$.test1.test2', false);
      expect(obj.test1.test2).to.equal(false);
    });

    it('should replace arrays when they are updated', function() {
      var obj = {test: [1, 2]};

      jason.set(obj, '$.test', [1]);
      expect(obj.test.length).to.equal(1);
    });

    it('should replace arrays when they are updated', function() {
      var obj = {test: [1]};

      jason.set(obj, '$.test', [2, 3, 4]);
      expect(obj.test.length).to.equal(3);
    });
  });
});
