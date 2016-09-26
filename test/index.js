import json from '../src/index.js';
import {expect} from 'chai';

describe('json', () => {
  describe('has', () => {
    var fixture = {'test': 1};

    it('should return true if the path exists', () => {
      expect(json.has(fixture, '$.test')).to.equal(true);
    });

    it('should return false if the path doesn\'t exist', () => {
      expect(json.has(fixture, '$.nothing')).to.equal(false);
    });
  });

  describe('get', () => {
    var fixture = {'test': 1};

    it('should get stuff by path', () => {
      expect(json.get(fixture, '$.test')).to.equal(1);
    });

    it('returns a default when the path is empty', () => {
      expect(json.get(fixture, '$.nothing', 2)).to.equal(2);
    });

    it('returns nothing when the path is empty and there is no default', () => {
      expect(json.get(fixture, '$.nothing')).to.be.undefined;
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
