function findHamiltonianPaths(graph) {
    const n = graph.length;
    const paths = [];

    function backtrack(currentPath, visited) {
        const lastNode = currentPath[currentPath.length - 1];

        // If the path includes all vertices, add it to the list of paths
        if (currentPath.length === n) {
            paths.push([...currentPath]);
            return;
        }

        for (let nextNode = 0; nextNode < n; nextNode++) {
            // Check if there's an edge and if the node hasn't been visited yet
            if (graph[lastNode][nextNode] && !visited[nextNode]) {
                visited[nextNode] = true;
                currentPath.push(nextNode);

                // Recurse with the updated path and visited nodes
                backtrack(currentPath, visited);

                // Backtrack: remove the last node from the path and mark it as unvisited
                currentPath.pop();
                visited[nextNode] = false;
            }
        }
    }

    // Try to find Hamiltonian paths starting from each vertex
    for (let startNode = 0; startNode < n; startNode++) {
        const visited = Array(n).fill(false);
        visited[startNode] = true;
        backtrack([startNode], visited);
    }

    return paths;
}




