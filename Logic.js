
class Logic {
    constructor() {
        this.allDominos = [];
        this.currentSubset=[];
        this.width = 856;
        this.height = 300;
        this.allTilesLeft = 20;
        this.allTilesTop = 20;
        this.initTilePos = {
            x: 0,
            y: 50
        };
        this.xStep = 50;
        this.yStep = 25;
        this.ctx = null;
        document.getElementById("btnBuildChains").addEventListener("click", () => {
            this.buildChains();
        });
        document.getElementById("btnClearOutput").addEventListener("click", () => {
            this.clearOutput();
        });
        document.getElementById("radRandomChoice").addEventListener("click", () => {
            this.handleRadChoice();
        });
        document.getElementById("radUserChoice").addEventListener("click", () => {
            this.handleRadChoice();
        });
        this.init();
    }
    init() {
        
        this.allDominos = this.generateDominoHorizontalTiles();
        this.drawAllTiles();
        
    }
    generateDominoHorizontalTiles() {
        const startCodePoint = 0x1F031; // Unicode for first domino horizontal tile
        const endCodePoint = 0x1F061;   // Unicode for last domino horizontal tile
        const tiles = [];

        let ind = 0;

        for (let codePoint = startCodePoint; codePoint <= endCodePoint; codePoint++) {
            //tiles.push(String.fromCodePoint(codePoint));
            let tile = new Domino();
            tile.index = ind;
            tile.unicode = String.fromCodePoint(codePoint);
            tiles.push(tile);
            ind++;
        }

        return tiles;
    }

   

  


    drawAllTiles() {
        
        const container = document.getElementById("left-panel");
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 7; j++) {
                const tile = this.allDominos[i * 7 + j];
                const tileElement = document.createElement('div');
                tileElement.id = "tile_" + i + "_" + j;
                tileElement.addEventListener("click", () => {
                    this.handleTileClick(tileElement.id)
                });
                tileElement.style.top =
                    this.allTilesTop + (this.initTilePos.y + i * this.yStep) + "px";
                tileElement.style.left =
                    this.allTilesLeft +
                    (this.initTilePos.x + j * this.xStep) + "px";
                

                tileElement.className = 'domino-tile';
                tileElement.textContent = tile.unicode;
               /* tileElement.innerText =  tile.unicode ;*/
                container.appendChild(tileElement);
            }
        }
    }

    /**
     * This method handles click on a div containing a tile
     *  and having id=tile_id.
     * Input parameter tile_id has structure "tile_i_j"
     * where i is row number and j is column number
     * in square matrix of tiles or, the same,
     * values of left side and right side of a tile
     * Using these values compute an index of the tile
     * and then draw the tile in  container "right-panel2"
     * @param {number} tile_id
     */
    handleTileClick(tile_id) {
        //alert(tile_id);
        let sep = "_";
        const selectedContainer = document.getElementById("right-panel2");
        if (document.getElementById("radUserChoice").checked) {
            
            let arr = tile_id.split(sep);
            let i = parseInt(arr[1]);
            let j = parseInt(arr[2]);
            let k = i * 7 + j;
            
            this.currentSubset.push(this.allDominos[k]);
            let cardinality = 0;
            if (document.getElementById("txtCardinality").value != "") {
                cardinality =
                    parseInt(document.getElementById("txtCardinality").value);
            }
            cardinality++;
            document.getElementById("txtCardinality").value = cardinality;
            this.drawSelectedTile(selectedContainer, k, cardinality);
        }
    }
    /**
     * This method builds random set of dominos
     * and shows them right-panel2
     * It takes as input a value from txtCardinality
     * that will be number of tiles and builds
     * this.currentSubset 
     * */
    randomChoice() {
        var n = parseInt(document.getElementById("txtCardinality").value);
        var count = 0;
        this.currentSubset = [];
        let usedIndices = [];
        const selectedContainer = document.getElementById("right-panel2");
        selectedContainer.innerHTML = "";
        while (count < n) {           
            let i = randomIntFromInterval(0, 6); //row index
            let j = randomIntFromInterval(0, 6);  //column index
            let ind = i * 7 + j;
            if (i < j) // j will be row index
                ind = j * 7 + i;  //i will be column index
            if (!usedIndices.includes(ind)) {
                this.currentSubset[count] = this.allDominos[ind];
                usedIndices.push(ind);
                this.drawSelectedTile(selectedContainer, ind, count);
               count++;
            }
        }
    }

    /**
     * This method draws a tile in the container
     * @param {HTMLDivElement} container
     * @param {number} ind - index of a tile in allSominos
     * @param {number} count - order number of a tile
     * in current subset
     */
    drawSelectedTile(container,ind, count) {
        
        let offsets = container.getBoundingClientRect();
        let top = offsets.top+50;
        let left = offsets.left;
        const tile = this.allDominos[ind];
        const tileElement = document.createElement('div');
        tileElement.style.top = (top + count * this.yStep)+"px";
        tileElement.style.left = left + "px";
        tileElement.className = 'domino-tile';
        tileElement.textContent = tile.unicode;
        container.appendChild(tileElement);
    }

    /**This method builds and shows chains of tiles
     * according to current subset of tiles
     * */
    buildChains() {
        
        let matrix = [];//adjacency matrix
        
        if (!document.getElementById("radUserChoice").checked)
        {
            this.randomChoice();
        }
        //end of random choice
        if (this.currentSubset.length == 0) {
            alert("No tiles were selected");
            return;
        }
        matrix = this.buildAjacencyMatrix();
        const pathsContainer = document.getElementById("right-panel3");
        pathsContainer.innerHTML = "";
        let paths = findHamiltonianPaths(matrix);
        if (paths.length == 0) {
            alert("No paths were found");
            return;
        }
        let countRightPaths = 0;
        for (var i = 0; i < paths.length; i++) {
            let result = this.showPath(pathsContainer, paths[i], i);
            if (result)
                countRightPaths++;
        }
        if (countRightPaths == 0) {
            alert("No paths were found")
        }
    }

    /**
     * This method builds an adjacency matrix of a graph
     * according the rules:
     * each tile from currentSubset will be a vertex
     * in this graph. Two vertices are connected
     * if the have one common value on their sides
     * */
    buildAjacencyMatrix()
    {
        
        let matrix = [];//adjacency matrix
        for (let i = 0; i < this.currentSubset.length; i++) {
            let tile1 = this.currentSubset[i];
            this.setTileSides(tile1);
            let row =
                Array(this.currentSubset.length).fill(0);;
            for (var j = 0; j < this.currentSubset.length; j++) {
                if (i == j)
                    row[j] = 0;
                else {
                    let tile2 = this.currentSubset[j];
                    this.setTileSides(tile2);
                    if (tile1.left == tile2.left ||
                        tile1.left == tile2.right ||
                        tile1.right == tile2.right ||
                        tile1.right == tile2.left)
                        row[j] = 1;
                }
            }//end cycle by j
            matrix[i] = row;
        }//end cycle by i
        return matrix;
    }

    /**
     * Given a tile get its index (in array of allDominos)
     * and compute its left and right side values
     * @param {Domino} tile
     */
    setTileSides(tile) {
        let ind = tile.index;
        tile.left = Math.floor(ind / 7);
        tile.right = ind - 7 * tile.left;
    }

    /**
     * This method accepts a path
     * consisting of all tiles of current subset such that
     * any consequent tiles contain common value on
     * one of their sides. But not all such path is suitable
     * for correct chain of tiles. For example
     * if the first 2 tiles in the path are (0,1) and (1,2)
     * and the third one is (1,3) that it cannot be
     * right successor for (1,2) because 1 is used on the
     * left side of the second tile. So such path won't
     * be used for a chain
     * @param {HTMLDivElement} container
     * @param {Array} path
     * @param {number} pathIndex
     */
    showPath(container, path, pathIndex)
    {
        //path contains indices of tiles in current subset
        let pathTiles = [];
        let lastTile = this.currentSubset[path[0]];
        if (path.length > 1)
        {
            //define true position of the first tile in the path
            let tile2 = this.currentSubset[path[1]];
            if (lastTile.right != tile2.left &&
                lastTile.right != tile2.right)
                lastTile = this.reverseTile(lastTile);
        }
        for (var i = 1; i < path.length; i++)
        {            
            pathTiles.push(lastTile);
            let tile = this.currentSubset[path[i]];
            if (lastTile.right != tile.left &&
                lastTile.right != tile.right)
                return false;
            if (lastTile.right != tile.left)
                tile = this.reverseTile(tile);
            lastTile = tile;
        }
        pathTiles.push(lastTile);
        //pathTiles were built
        for (var i = 0; i < pathTiles.length; i++) {
            let offsets = container.getBoundingClientRect();
            let top = offsets.top + 50;
            let left = offsets.left;
            const tileElement = document.createElement('div');
            tileElement.style.top = (top + pathIndex * this.yStep) + "px";
            tileElement.style.left = (left + i * this.xStep) + "px";
            tileElement.className = 'domino-tile';
            tileElement.textContent = pathTiles[i].unicode;
            container.appendChild(tileElement);
        }
        return true;
    }
    reverseTile(tile)
    {   
        let i = tile.right;
        let j = tile.left;
        let k = 7 * i + j;
        let reversed = this.allDominos[k];
        reversed.left = i;
        reversed.right = j;
        return reversed;
    }

   
    clearOutput() {
        document.getElementById("txtCardinality").value = "";
        document.getElementById("right-panel2").textContent = "";
        document.getElementById("right-panel3").textContent = "";
        this.currentSubset = [];
    }
    handleRadChoice() {
    this.clearOutput();
    if (document.getElementById("radUserChoice").checked) {
        document.getElementById("txtCardinality").value = "";
    }
}
}
class Domino {
    constructor()
    {
        this.index = 0; //index of this tile in array of all dominos
        this.left = 0; //value on the left side
        this.right = 0; //value on the right side
        this.unicode = "";
    }
        
}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
new Logic();


