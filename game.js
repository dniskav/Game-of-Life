import { shapes } from "./shapes/shapes.js";

const dbg = document.getElementById('debug');

class game {
    constructor(nxC, nyC) {
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        const resolution = 5;
        const cols = canvas.width / resolution;
        const rows = canvas.height / resolution;
        const colors = {
            live: 'yellow',
            death: 'black'
        };
        let dropCounter = 0;
        let lastTime = 0;

        ctx.scale(resolution, resolution);

        this.erasing = false;
        this.running = false;
        this.framesSteps = 5;
        this.currentState = [];
        let nextState = [];
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

        function createGrid(cols, rows) {
            return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        }

        document.addEventListener("keydown", (ev) => {
            if (ev.keyCode === 18) {
                this.setErase(true);
            }
        });

        document.addEventListener("keyup", (ev) => {
            this.setErase(false);
        });

        this.setFramesStep = (framesXmseg) => {
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

        this.setErase = (flag) => {
            this.erasing = flag;
        };

        this.random = () => {
            const randomState = [];
            for (let i = 0; i < nyC; i++) {
                randomState.push(
                    Array.from(Array(nxC), () => (Math.random() > 0.4 ? 1 : 0))
                );
            }

            this.updateBoard(randomState);
        };

        this.gen = (shape) => {
            const fig = shapes[shape];
            this.buildBoard();
            const shapeState = [];

            fig.forEach((row, ndx) => {
                this.currentState[ndx].splice(0, row.length, ...row);
            });
        };

        this.buildBoard = () => {
            this.currentState = [];
            for (let i = 0; i < nyC; i++) {
                this.currentState.push(Array.from(Array(nxC), () => 0));
            }
        };

        this.updateBoard = (state) => {
            this.currentState = [...state];

            nextState = this.currentState.map((row) => [...row]);
        };

        this.render = async () => {
            nextState = this.currentState.map((row, y) => row.map((status, x) => {
                ctx.fillStyle = !!status ? colors.live : colors.death;
                ctx.fillRect(x, y, 1, 1);
                let willBealive = status;
                const nyC = this.currentState[0].length;
                const nxC = this.currentState.length;
                const yCoord = (y) => (y + nyC) % nyC;
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

            this.updateBoard(nextState);
        };

        this.frameSet = (time = 0) => {
            if (!this.running) {
                return;
            }
            const deltatime = time - lastTime;
            lastTime = time;
            dropCounter += deltatime;

            if (dropCounter > this.framesSteps * 10) {
                dropCounter = 0;
                this.render();
            }

            this.timeout = requestAnimationFrame(this.frameSet);
        };

        this.start = () => {
            if (this.running) return;
            this.running = true;
            this.frameSet();
        };

        this.stop = () => {
            this.running = false;
            cancelAnimationFrame(this.timeout);
        };

        document.addEventListener('DOMContentLoaded', () => {
            const board = this.buildBoard();
        });

        return this;
    }
}

export default game;
