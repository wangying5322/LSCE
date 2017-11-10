var exampleDropOptions = {
  tolerance: 'touch',
  hoverClass: 'dropHover',
  activeClass: 'dragActive'
}

var exampleColor = '#00f'
var exampleEndpoint1 = {
  endpoint: 'Rectangle',
  paintStyle: { width: 25, height: 21, fill: exampleColor },
  isSource: true,
// reattach: true,
  scope: 'Blue',
  connectorStyle: {
    gradient: {stops: [
      [0, exampleColor],
      [0.5, '#09098e'],
      [1, exampleColor]
    ]},
    strokeWidth: 5,
    stroke: exampleColor,
    dashstyle: '2 2'
  },
  maxConnections: 3,
  isTarget: true,
  dropOptions: exampleDropOptions
}

var color2 = '#316b31'
var exampleEndpoint2 = {
  endpoint: ['Dot', { radius: 11 }],
  paintStyle: { fill: color2 },
  isSource: true,
  scope: 'Green',
  connectorStyle: { stroke: color2, strokeWidth: 6 },
  connector: [ 'Bezier', { curviness: 63 } ],
  maxConnections: 3, // 不能detach
  isTarget: true,
  dropOptions: exampleDropOptions
}

var example3Color = 'rgba(229,219,61,0.5)'
var exampleEndpoint3 = {
  endpoint: [ 'Dot', {radius: 15} ],
// anchor: 'BottomLeft',
  paintStyle: { fill: example3Color, opacity: 0.5 },
  isSource: true,
  scope: 'Yellow',
  connectorStyle: {
    stroke: example3Color,
    strokeWidth: 4
  },
  connector: [ 'Bezier', { curviness: 63 } ], // 'Straight'
  maxConnections: 3,
  isTarget: true,
  dropOptions: exampleDropOptions,
  onMaxConnections: function (info) {
    alert('Cannot drop connection ' + info.connection.id + ' : maxConnections has been reached on Endpoint ' + info.endpoint.id)
  }
}

export {exampleEndpoint1, exampleEndpoint2, exampleEndpoint3}