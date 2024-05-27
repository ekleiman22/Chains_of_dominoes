
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

    buildChains() {
        let arrValues = [];// values on sides of tiles that belong to
            //tiles from currentSubset
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
            //build graph adjacency matrix
            //Firstly find all values on sides of tiles that belong to
            //tiles from currentSubset
            
            for (let i = 0; i < this.currentSubset.length; i++) {
                let tile = this.currentSubset[i];
                let ind = tile.index;
                tile.left = Math.floor(ind / 7);
                tile.right = ind - 7 * tile.left;
                if (!arrValues.includes(tile.left))
                    arrValues.push(tile.left);
                if (!arrValues.includes(tile.right))
                    arrValues.push(tile.right);
            }
            let l = arrValues.length;
            
            for (let i = 0; i < l; i++) {
                let value1 = arrValues[i];
                let row = [];
                for (let j = 0; j < l; j++) {
                    let value2 = arrValues[j];
                    row[j] = 0;
                    for (let k = 0; k < this.currentSubset.length; k++) {
                        let tile = this.currentSubset[k];
                        if (tile.left == value1 && tile.right == value2 ||
                            tile.right == value1 && tile.left == value2)
                            row[j] = 1;
                    }
                }
                matrix[i] = row;
            }
            
        
        const pathsContainer = document.getElementById("right-panel3");
        pathsContainer.innerHTML = "";
        let paths = findHamiltonianPaths(matrix);
        if (paths.length == 0) {
            alert("No paths were found");
            return;
        }
        for (var i = 0; i < paths.length; i++) {
            this.showPath(pathsContainer, arrValues, paths[i], i)
        }
    }
    showPath(container, values,path,pathIndex) {
        //path is an array of indices of elements of array values
        //each 2 neighboring indices corresponds a tile
        let pathTiles = [];
        for (var i = 0; i < path.length-1; i++) {
            let value1 = values[path[i]];
            let value2 = values[path[i + 1]];
            let ind = 0;
            //if (value1 > value2)
                ind = value1 * 7 + value2;
            //else
            //    ind = value2 * 7 + value1;
            pathTiles.push(this.allDominos[ind]);
        }
        for (var i = 0; i < pathTiles.length; i++) {
            let offsets = container.getBoundingClientRect();
            let top = offsets.top+50;
            let left = offsets.left;
            const tileElement = document.createElement('div');
            tileElement.style.top = (top + pathIndex * this.yStep) + "px";
            tileElement.style.left = (left + i * this.xStep) + "px";
            tileElement.className = 'domino-tile';
            tileElement.textContent = pathTiles[i].unicode;
            container.appendChild(tileElement);
        }
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


