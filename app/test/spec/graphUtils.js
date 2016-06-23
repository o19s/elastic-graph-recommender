describe('Graph Utilities', function() {
  beforeEach(module('recsApp'));

  var graphUtils = null;

  beforeEach(function() {
    inject(function(_graphUtils_) {
      graphUtils = _graphUtils_;
    });
  });

  it('has a property', function() {
    console.log('Running test ');
    expect(graphUtils.hasOwnProperty('parse')).toBeTruthy();
  });

});
