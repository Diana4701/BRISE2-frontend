import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'

import { ref } from 'vue'

export function useLayout() {
  const { findNode } = useVueFlow()

  const graph = ref(new dagre.graphlib.Graph())

  const previousDirection = ref('LR')

  function layout(nodes : Node[], edges: Edge[], direction: string) {
   if (!nodes || !edges) {
        console.warn('layout() called without nodes/edges', { nodes, edges })
        return nodes ?? []
    }

    const dagreGraph = new dagre.graphlib.Graph()
    graph.value = dagreGraph
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({ rankdir: direction })
    previousDirection.value = direction

    for (const node of nodes) {
        const graphNode = findNode(node.id)
        if(!graphNode) continue
      dagreGraph.setNode(node.id, { width: graphNode.dimensions.width || 250, height: graphNode.dimensions.height || 80 })
    }

    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    dagre.layout(dagreGraph)


    return nodes.map((node : Node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      if (!nodeWithPosition) return node
const graphNode = findNode(node.id)
    const width = graphNode?.dimensions.width || 150
    const height = graphNode?.dimensions.height || 70

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x - width / 2, y: nodeWithPosition.y -  height / 2, },
      }
    })
  }

  return { graph, layout, previousDirection }
}
