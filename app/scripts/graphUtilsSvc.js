angular.module('recsApp')
  .factory('graphUtils', graphUtils);

// Utilities for making the Elastic graph response
// easier to deal with
function graphUtils() {
  return {
    parse: parse
  };

  function parse(vertices, connections) {
    // turn the graph into a tree rooted at depth 0
    //
    //   FOO <---> BAR
    //   /\      =/
    //    |     /
    //   \/  |=
    //   BAZ
    //
    //   If FOO is at depth 0, then make this
    //   graph a tree with foo at its root


    function getOutbound(listIdx) {
      var outbounds = [];
      angular.forEach(connections, function(connection) {
        if (connection.source === listIdx) {
          outbounds.push(connection);
        }
      });
      return outbounds;
    }

    function getConnectionsAtDepth(listIdx, depth) {
      var outbound = getOutbound(i);
      var outboundAtDepth = [];
      angular.forEach(outbound, function(connection) {
        var targetVtx = vertices[connection.target];
        if (targetVtx.depth === depth) {
          outboundAtDepth.push(targetVtx);
        }
      });
      return outboundAtDepth;
    }

    var i = 0;
    var rootVertices = [];
    for (i = 0; i < vertices.length; i++) {
      var vertex = vertices[i];
      if (vertex.depth === 0) {
        var nextOutbound = getConnectionsAtDepth(i, 1);
        vertex.outbound = nextOutbound;
        rootVertices.push(vertex);
      }
    }

    return rootVertices;
  }

}
