function generateDominoChains(tiles) {
    let result = [];

    function backtrack(chain, remainingTiles) {
        if (remainingTiles.length === 0) {
            result.push([...chain]);
            return;
        }

        for (let i = 0; i < remainingTiles.length; i++) {
            let [left, right] = remainingTiles[i];

            // Try the tile in the original orientation
            if (chain.length === 0 || chain[chain.length - 1][1] === left) {
                chain.push([left, right]);
                let newRemainingTiles = remainingTiles.slice(0, i).concat(remainingTiles.slice(i + 1));
                backtrack(chain, newRemainingTiles);
                chain.pop();
            }
            if (left == right)
                continue;
            // Try the tile in the reversed orientation
            if (chain.length === 0 || chain[chain.length - 1][1] === right) {
                chain.push([right, left]);
                let newRemainingTiles = remainingTiles.slice(0, i).concat(remainingTiles.slice(i + 1));
                backtrack(chain, newRemainingTiles);
                chain.pop();
            }
        }
    }

    backtrack([], tiles);
    return result;
}