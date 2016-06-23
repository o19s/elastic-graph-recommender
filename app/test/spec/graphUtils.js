describe('Graph Utilities', function() {
  beforeEach(module('recsApp'));

  var graphUtils = null;

  beforeEach(function() {
    inject(function(_graphUtils_) {
      graphUtils = _graphUtils_;
    });
  });

  it('parses to depth-0 rooted graph', function() {
    var vertices = [
      {
        term: 'foo',
        depth: 0
      },
      {
        term: 'bar',
        depth: 1
      },
      {
        term: 'baz',
        depth: 1
      }
    ];

    // Elastic graph 'connections' list use source/target
    // that refer to the indices above
    var connections = [
      { // foo -> bar
        source: 0,
        target: 1
      },
      { // boo -> baz
        source: 0,
        target: 2
      },
      { // bar -> baz
        // its unclear how we'll handle this for now
        source: 1,
        target: 2
      }
    ];

    var d0rootedGraph = graphUtils.parse(vertices, connections);

    expect(d0rootedGraph.length).toBe(1);
    expect(d0rootedGraph[0].term).toBe('foo');
    var fooOutbound = d0rootedGraph[0].outbound;
    expect(fooOutbound.length).toBe(2);
    expect(['bar', 'baz']).toContain(fooOutbound[0].term);
    expect(['bar', 'baz']).toContain(fooOutbound[1].term);

  });

  it('has a property', function() {
    console.log('Running test ');
    expect(graphUtils.hasOwnProperty('parse')).toBeTruthy();
  });

});
