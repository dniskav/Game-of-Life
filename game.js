
import Square from './Square.js';
import planeShape from './shapes/plane.js';
import planesGunShape from './shapes/planesGun.js';

function game(container, gWidth, gHeight, nxC, nyC){
    let squares = [];
    this.erasing = false;
    this.running = false;
    this.framesSteps = 100;
    this.currentState = [];
    let nextState = [];
    this.timeout = null;
    const dimSW = gWidth / nxC;
    const dimSH = gHeight / nyC;
    const velocityTag = document.getElementById('velocityTag');
    velocityTag.innerText = this.framesSteps;
    this.operations = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ];


    document.addEventListener('keydown', (ev) => {
        if(ev.keyCode === 18) {
            this.setErase(true);
        }
    });

    document.addEventListener('keyup', (ev) => {
        this.setErase(false);
    });

    this.setFramesStep = (framesXmseg) => {
        if(this.running) {
            this.stop();
            this.framesSteps = framesXmseg % 2000;
            velocityTag.innerText = this.framesSteps;
            this.start();
        } else {
            this.framesSteps = framesXmseg % 2000;
            velocityTag.innerText = this.framesSteps;
        }
    };

    this.setErase = (flag) => {
        this.erasing = flag;
    };

    this.random = () => {
        const randomState = [];
        for(let i = 0; i < nyC; i++) {
            randomState.push(Array.from(Array(nxC), () => (Math.random() > 0.4) ? 1 : 0));
        }

        this.updateBoard(randomState);
    };

    this.gen = (shape) => {
        const shapeState = [];
        for(let i = 0; i < nyC; i++) {
            shapeState.push(Array.from(Array(nxC), () => 0));
        }

        switch(shape) {
            case 'plane':
                shapeState.forEach( (row, ndx) => {
                    if(ndx < planeShape.length) {
                        row.splice(planeShape[0][ndx], planeShape.length, ...planeShape[ndx]);
                    }
                });
                break;
            case 'planesGun':
                shapeState.forEach( (row, ndx) => {
                    if(ndx < planesGunShape.length) {
                        row.splice(planesGunShape[0][ndx], planesGunShape.length, ...planesGunShape[ndx]);
                    }
                });
                break;
        }

        this.updateBoard(shapeState);
    };

    this.buildBoard = () => {
        const board = document.createElement('div');
        board.style.width = `${gWidth}px`;
        board.style.height = `${gHeight}px`;
        board.className = 'board';
        this.currentState = [];
        for(let i = 0; i < nyC; i++) {
            this.currentState.push(Array.from(Array(nxC), () => 0));
        }
    
        for(let y = 0; y < nyC; y++) {
            squares.push([]);
            for(let x = 0; x < nxC; x++) {
                const square = new Square(x, y, this.currentState, dimSW, dimSH , this.erasing);
                squares[y].push(square);
                board.appendChild(square.box);
            }
        }
    
        return board;
    };

    this.updateBoard = (state) => {
        squares.forEach( (row, x) => row.forEach( (box, y) => {
            if(state[x][y]) {
                box.toLive();
            } else {
                box.toDie();
            }
        }));

        nextState = this.currentState.map( row => [...row]);
    };

    this.render = async () => {
        nextState = this.currentState.map( (row, y) => row.map( (status, x) => {
            let willBealive = status;
            const nyC = this.currentState[0].length;
            const nxC = this.currentState.length;
            const yCoord = (y) => (y + nyC) % nyC;
            const xCoord = (x) => (x + nxC) % nxC;
    
            const neighbors =  this.operations.reduce((acum, [_y, _x]) => {
                const newY = yCoord(y + _y);
                const newX = xCoord(x + _x);
    
                return acum + this.currentState[newY][newX];
            }, 0);
    
            //a dead cell with 3 neighbors goto live
            if(!status && neighbors === 3) {
                willBealive = 1;
    
            //a alive cell with less than 2 or more than 3 go to die
            } else if (status && neighbors < 2 || neighbors > 3) {
                willBealive = 0;
            }

            return willBealive;
        }));

        this.updateBoard(nextState);
    };

    this.frameSet = () => {
        if(!this.running) {
            return;
        }
        this.render();
        this.timeout = setTimeout(this.frameSet ,this.framesSteps);
    };

    this.start = () => {
        if(this.running) return;
        this.running = true;
        this.frameSet();
    };
    
    this.stop = () => {
        this.running = false;
        clearTimeout(this.timeout);
    };

    const board = this.buildBoard();
    container.appendChild(board);

    return this;
}

export default game;
