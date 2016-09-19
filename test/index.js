import json from '../src/index.js';
import {expect} from 'chai';

describe('json', () => {
  describe('get', () => {
    var fixture = {'test': 1, 'test2': 2};

    it('should get stuff by path', () => {
      expect(json.get(fixture, '$.test')).to.equal(1);
    });

    it('returns a default when the path is empty', () => {
      expect(json.get(fixture, '$.nothing', 2)).to.equal(2);
    });

    it('returns nothing when the path is empty and there is no default', () => {
      expect(json.get(fixture, '$.nothing')).to.be.undefined;
    });

    it('should concat results when using the concat function', () => {
      expect(json.get(fixture, 'concat($.test, $.test2)')).to.eql([1, 2]);
    });

    it('should concat and uniquify results when using the uniq function', () => {
      expect(json.get(fixture, 'uniq($.test, $.test2)')).to.eql([1, 2]);
    });

    it('should apply functions no matter the case of the name', () => {
      expect(json.get(fixture, 'UNIQ($.test, $.test2)')).to.eql([1, 2]);
    });
  });

  describe('set', () => {
    it('should set values that already exist', () => {
      var obj = {'test': 1};

      json.set(obj, '$.test', 2);
      expect(obj.test).to.equal(2);
    });

    it('should create values that do not exist', () => {
      var obj = {};

      json.set(obj, '$.test', 1);
      expect(obj.test).to.not.be.undefined;
    });

    it('should create nested values that do not exist', () => {
      var obj = {};

      json.set(obj, '$.test1.test2', 1);
      expect(obj.test1.test2).to.equal(1);
    });

    it('should update nested values that it created', () => {
      var obj = {};

      json.set(obj, '$.test1.test2', true);
      json.set(obj, '$.test1.test2', false);
      expect(obj.test1.test2).to.equal(false);
    });

    it('should replace arrays when they are updated', () => {
      var obj = {test: [1, 2]};

      json.set(obj, '$.test', [1]);
      expect(obj.test.length).to.equal(1);
    });

    it('should replace arrays when they are updated', () => {
      var obj = {test: [1]};

      json.set(obj, '$.test', [2, 3, 4]);
      expect(obj.test.length).to.equal(3);
    });
  });
});