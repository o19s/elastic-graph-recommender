describe('Graph Utilities', function() {
  beforeEach(module('recsApp'));

  var graphUtils = null;
  beforeEach(inject(function(_graphUtils_) {
    graphUtils = _graphUtils_;
  }));

  it('has a property', function() {
    expect(graphUtils).hasOwnProperty('parse');
  });

});
