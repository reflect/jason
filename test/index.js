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
    var fixture = { 'test': 1, 'test2': 2 };

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

    it('should allow the user to query an object keys', () => {
      expect(json.get(fixture, 'KEYS($)')).to.eql(['test', 'test2']);
    });

    it('should allow multiple arguments when using the keys function', () => {
      const complexFilter = {
        colby: { drink: 'coffee' },
        geoff: { food: 'beefsticks' },
      };

      expect(json.get(complexFilter, 'KEYS($.colby, $.geoff)')).to.eql(['drink', 'food']);
    })
  });

  describe('derefRecursive', () => {
    it('should recursively deref refs in an object tree', () => {
      const fixtureObj = {
        people: { names: '$.names' },
        months: ['May', 'June', 'July'],
        ages: '$.people.ages'
      };

      const fixtureVal = {
        names: ['Steve', 'Bob'],
        people: {
          ages: [24, 12],
        },
      };

      const value = json.derefRecursive(fixtureObj, fixtureVal);
      expect(value).to.eql({
        people: { names: ['Steve', 'Bob'] },
        months: ['May', 'June', 'July'],
        ages: [24, 12],
      });
    });

    it('should allow the user to supply a callback for resolving the paths', () => {
      const fixtureObj = { firstName: '$.NAME.name' };
      const fixtureVal = { steve: { name: 'Steve' } };

      const value = json.derefRecursive(fixtureObj, fixtureVal, (path) => {
        return path.replace('NAME', 'steve');
      });

      expect(value).to.eql({ firstName: 'Steve' });
    });

    it('should recognize keys with expressions', () => {
      const fixtureObj = { names: 'KEYS($.names)' };
      const fixtureVal = { names: { person1: 'Steve', person2: 'Joe' } };

      const value = json.derefRecursive(fixtureObj, fixtureVal);

      expect(value).to.eql({ names: ['person1', 'person2'] });
    });
  });

  describe('set', () => {
    it('should set values that already exist', () => {
      var obj = { 'test': 1 };

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
      var obj = { test: [1, 2] };

      json.set(obj, '$.test', [1]);
      expect(obj.test.length).to.equal(1);
    });

    it('should replace arrays when they are updated', () => {
      var obj = { test: [1] };

      json.set(obj, '$.test', [2, 3, 4]);
      expect(obj.test.length).to.equal(3);
    });
  });
});
