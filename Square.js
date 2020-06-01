class Square {
    constructor(x, y, stateMtx, w, h, erasing) {
        this.x = x;
        this.y = y;
        this.stateMtx = stateMtx;
        this.erasing = erasing;
        this.box = document.createElement('div');
        this.box.style.width = `${w}px`;
        this.box.style.height = `${h}px`;
        this.box.className = `q-block ${this.alive ? 'alive' : ''}`;
        this.box.addEventListener('click', this.toggle);
        this.box.addEventListener('mouseover', this.draw);
        this.box.alive = this.alive;
        this.box.x = this.x;
        this.box.y = this.y;
        this.box.context = this;
    }


    toLive() {
        this.stateMtx[this.y][this.x] = 1;
        this.box.className = 'q-block alive';
    }
    
    toDie() {
        this.stateMtx[this.y][this.x] = 0;
        this.box.className = 'q-block';
    }

    draw(ev) {
        const { context } = this;
        if(ev.buttons === 1 && !context.erasing) {
            context.toLive();
        } else if(ev.buttons === 1 && context.erasing) {
            context.toDie();
        }
    }

    toggle() {
        const { context } = this;
        const alive = !!context.stateMtx[context.y][context.x];
        if(alive) {
            context.toDie();
        } else {
            context.toLive();
        }
    }
}

export default Square;
