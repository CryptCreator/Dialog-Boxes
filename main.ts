/*scene.setBackgroundColor(8)
game.setDialogFrame(img`
    ..ccccc....333.....333...ccccc...
    .c33b33c..39993...39993.c33b33c..
    c3b33bb3c39999933399999c3bb33b3c.
    c33b33b3c99111999991119c3b33b33c.
    cb33b33bc91999199919991cb33b33bc.
    c3b33bbbcb999991119999bcbbb33b3c.
    c3bb3bbd1b111119991111b1dbb3bb3c.
    .c33bbd1b11111111111111b1dbb33c..
    ..cccc1b1111111111111111b1cccc...
    .3991bb111111111111111111bb993...
    3991991111111111111111111191993..
    39919911111111111111111111991993.
    39919911111111111111111111991993.
    .3991911111111111111111111991993.
    ..39919111111111111111111191993..
    ..3991911111111111111111191993...
    ..3991911111111111111111191993...
    .39919111111111111111111191993...
    3991991111111111111111111191993..
    39919911111111111111111111991993.
    39919911111111111111111111991993.
    .3991911111111111111111111991993.
    ..699bb111111111111111111bb1993..
    ..cccc1b1111111111111111b1cccc...
    .c33bbd1b11111111111111b1dbb33c..
    c3bb3bbd1b111199911111b1dbb3bb3c.
    c3b33bbbcb999911199999bcbbb33b3c.
    cb33b33bc19991999199919cb33b33bc.
    c33b33b3c91119999911199c3b33b33c.
    c3b33bb3c99999333999993c3bb33b3c.
    .c33b33c.39993...39993..c33b33c..
    ..ccccc...333.....333....ccccc...
    .................................
    `)
//game.showDialog("Hello", "Yes Sir?", "something");
game.showLongText("Hello", DialogLayout.Bottom)
//game.BaseDialog.resize();*/
//let test = sprites.create(assets.image`myImage`);
//test.image.fillRect(0, 0, test.width / 3, test.height / 3, 0);
//test.image.drawPartial()
scene.setBackgroundColor(0);
//let sprit = sprites.create(assets.image`myImage`);

class NineSliceBox {
    image: Image;
    frame: Image;
    cursor: Image;
    nineSlice: Image[];

    x: number;
    y: number;
    unit: number;
    rows: number;
    columns: number;

    innerLeft: number;
    innerTop: number;
    cursorCount: number;

    font: image.Font;
    textColor: number;

    constructor(x: number, y: number, width: number, height: number, frame?: Image, font?: image.Font, textColour?: number, cursor?: Image) {
        this.cursorCount = 0;
        this.resize(x, y, width, height, frame, font, textColour, cursor);
    }

    resize(x: number, y: number, width: number, height: number, frame?: Image, font?: image.Font, textColour?: number, cursor?: Image) {
        this.x = x; this.y = y;
        this.frame = frame ||assets.image`defaultFrame`;
        this.unit = Math.floor(this.frame.width / 3);
        this.columns = Math.floor(width / this.unit);
        this.rows = Math.floor(height / this.unit);
        this.innerLeft = (width - (this.columns * this.unit)) >> 1;
        this.innerTop = (height - (this.rows * this.unit)) >> 1;
        this.image = image.create(this.x + width, this.y + height);
        this.font = font || image.font8;
        this.cursor = cursor ||assets.image`cursor`;
        this.textColor = textColour == undefined ? textColour = 15 : textColour;

        this.calculateSlices();
        this.draw();
    }

    update() {
        this.draw();
    }

    protected calculateSlices() {
        this.nineSlice = [];
        for (let i = 0; i < 9; i++) {
            this.nineSlice.push(image.create(this.unit, this.unit))
            this.drawPartial(this.nineSlice[i], 0, 0, i, this.unit, this.unit);
        }
    }

    protected draw() {
        let edgeX = this.image.width - this.unit;
        let edgeY = this.image.height - this.unit;

        for (let c = 2; c < this.columns; c++) {
            this.image.drawTransparentImage(this.nineSlice[1], this.x + ((c - 1) * this.unit), this.y);
            this.image.drawTransparentImage(this.nineSlice[7], this.x + ((c - 1) * this.unit),  edgeY);
        }
        this.drawPartial(this.image, this.x + ((this.columns - 1) * this.unit),
            this.y, 1, this.image.width - ((this.columns * this.unit) + this.x), this.unit);
        this.drawPartial(this.image, this.x + ((this.columns - 1) * this.unit),
            edgeY, 7, this.image.width - ((this.columns * this.unit) + this.x), this.unit);

        for (let r = 2; r < this.rows; r++) {
            this.image.drawTransparentImage(this.nineSlice[3], this.x, this.y + ((r - 1) * this.unit));
            this.image.drawTransparentImage(this.nineSlice[5], edgeX, this.y + ((r - 1) * this.unit));
        }
        this.drawPartial(this.image, this.x, this.y + ((this.rows - 1) * this.unit),
            3, this.unit, this.image.height - ((this.rows * this.unit) + this.y));
        this.drawPartial(this.image, edgeX, this.y + ((this.rows - 1) * this.unit),
            5, this.unit, this.image.height - ((this.rows * this.unit) + this.y));

        //Edges
        this.image.drawTransparentImage(this.nineSlice[0], this.x, this.y);
        this.image.drawTransparentImage(this.nineSlice[2], edgeX, this.y);
        this.image.drawTransparentImage(this.nineSlice[6], this.x, edgeY);
        this.image.drawTransparentImage(this.nineSlice[8], edgeX, edgeY);
        
        this.image.fillRect(
            this.unit + this.x, this.unit + this.y, edgeX - this.x -this.unit, edgeY - this.y - this.unit,
            this.frame.getPixel(this.unit, this.unit));
    }

    protected drawPartial(image: Image, x: number, y: number, 
     index: number, width: number = 0, height: number = 0) {
        const xf = (index % 3) * this.unit;
        const yf = Math.idiv(index, 3) * this.unit;


        for (let e = 0; e < width; e++) {
            for (let t = 0; t < height; t++) {
                image.setPixel(
                    x + e,
                    y + t,
                    this.frame.getPixel(xf + e, yf + t));
            }
        }
    }

    protected drawCursorRow() {
        let offset = 0;
        if (this.cursorCount > 40) {
            offset = 1;
        }

        this.cursorCount = (this.cursorCount + 1) % 80;

        this.image.drawTransparentImage(
            this.cursor,
            offset + this.image.width - (this.unit * 1.5),
            this.image.height - (this.unit * 1.5)
        )
    }
}

let dialog = new game.BaseDialog(50, 50);


let nineSlice = new NineSliceBox(0, 0, 100, 100, assets.image`myImage`);

let dialogs = new game.BaseDialog(screen.width, screen.height);
//let tester = new Test(screen.width, screen.height);
/*game.onUpdate(function() {
    nineSlice.drawNineSlice();
    console.log("Hello");
})*/
dialog.frame = assets.image`myImage`;
dialog.update();
let dem = [0, 0, 20, 20];
let pressed = [0, 0];
scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
    pressed = [Math.sign(controller.dx()) * pressed[0], Math.sign(controller.dx()) * pressed[1]];
    if (controller.A.isPressed()) {
        dem[0] += Math.floor(controller.dx());
        dem[1] += Math.floor(controller.dy());
    } else {
        dem[2] += Math.floor(controller.dx());
        dem[3] += Math.floor(controller.dy());
    }
    //nineSlice.resize(dem[0], dem[1],assets.image`myImage`, undefined);
    nineSlice.resize(dem[0], dem[1], dem[2], dem[3],assets.image`myImage1`);
    target.drawTransparentImage(nineSlice.image, 0, 0);
    game.showLongText
});
