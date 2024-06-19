import { shapes } from "./shapes/shapes.js";

const dbg = document.getElementById('debug');

class game {
    constructor(nxC, nyC) {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.resolution = 5;
        const cols = this.canvas.width / this.resolution;
        const rows = this.canvas.height / this.resolution;
        this.colors = {
            live: 'yellow',
            death: 'black'
        };
        this.dropCounter = 0;
        this.lastTime = 0;

        this.ctx.scale(this.resolution, this.resolution);

        this.nxC = nxC;
        this.nyC = nyC;
        this.erasing = false;
        this.running = false;
        this.framesSteps = 5;
        this.currentState = [];
        this.nextState = [];
        this.timeout = null;
        const dimSW = 500;
        const dimSH = 500;
        const velocityTag = document.getElementById("velocityTag");
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

        this.canvas.addEventListener('click', (event) => {
            const { gridX, gridY } = this.getGridCoordinates(event);
            console.log(`Clic en la celda: (${gridX}, ${gridY})`);
            // this.toggleBoxState(gridX, gridY);
        });

        document.addEventListener("keydown", (ev) => {
            if (ev.key === 'Alt') {
                this.setErase(true);
            }
        });

        document.addEventListener("keyup", (ev) => {
            this.setErase(false);
        });

        document.addEventListener('DOMContentLoaded', () => {
            const board = this.buildBoard();
        });

        return this;
    }

    toggleBoxState(posX, posY) {
        this.currentState[posX][posY] = this.erasing ? 0 : 1;
    }


    getGridCoordinates = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const unscaledX = x / 5;
        const unscaledY = y / 5;

        const gridX = Math.floor(unscaledX / this.resolution);
        const gridY = Math.floor(unscaledY / this.resolution);

        return { gridX, gridY };
    }

    setFramesStep = (framesXmseg) => {
        if (this.running) {
            this.stop();
            this.framesSteps = framesXmseg % 2000;
            velocityTag.innerText = this.framesSteps;
            this.start();
        } else {
            this.framesSteps = framesXmseg % 2000;
            velocityTag.innerText = this.framesSteps;
        }
    };

    setErase = (flag) => {
        this.erasing = flag;
    };

    random = () => {
        const randomState = [];
        for (let i = 0; i < this.nyC; i++) {
            randomState.push(
                Array.from(Array(this.nxC), () => (Math.random() > 0.4 ? 1 : 0))
            );
        }

        this.updateBoard(randomState);
    };

    gen = (shape) => {
        const fig = shapes[shape];
        this.buildBoard();
        const shapeState = [];

        fig.forEach((row, ndx) => {
            this.currentState[ndx].splice(0, row.length, ...row);
        });
    };

    buildBoard = () => {
        this.currentState = [];
        for (let i = 0; i < this.nyC; i++) {
            this.currentState.push(Array.from(Array(this.nxC), () => 0));
        }
    };

    updateBoard = (state) => {
        this.currentState = [...state];

        this.nextState = this.currentState.map((row) => [...row]);
    };

    render = async () => {
        this.nextState = this.currentState.map((row, y) => row.map((status, x) => {
            this.ctx.fillStyle = !!status ? this.colors.live : this.colors.death;
            this.ctx.fillRect(x, y, 1, 1);
            let willBealive = status;
            this.nyC = this.currentState[0].length;
            const nxC = this.currentState.length;
            const yCoord = (y) => (y + this.nyC) % this.nyC;
            const xCoord = (x) => (x + nxC) % nxC;

            const neighbors = this.operations.reduce((acum, [_y, _x]) => {
                const newY = yCoord(y + _y);
                const newX = xCoord(x + _x);

                return acum + this.currentState[newY][newX];
            }, 0);

            //a dead cell with 3 neighbors goto live
            if (!status && neighbors === 3) {
                willBealive = 1;

                //a alive cell with less than 2 or more than 3 go to die
            } else if ((status && neighbors < 2) || neighbors > 3) {
                willBealive = 0;
            }

            return willBealive;
        })
        );

        this.updateBoard(this.nextState);
    };

    frameSet = (time = 0) => {
        if (!this.running) {
            return;
        }
        const deltatime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltatime;

        if (this.dropCounter > this.framesSteps * 10) {
            this.dropCounter = 0;
            this.render();
        }

        this.timeout = requestAnimationFrame(this.frameSet);
    };

    start = () => {
        if (this.running) return;
        this.running = true;
        this.frameSet();
    };

    stop = () => {
        this.running = false;
        cancelAnimationFrame(this.timeout);
    };
}

export default game;
