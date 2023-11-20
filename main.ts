namespace nineSlice {
    export class NineSliceBox {
        image: Image;
        frame: Image;
        nineSlice: Image[];

        pt1: number[];
        pt2: number[];
        ptTarget1: number[];
        ptTarget2: number[];
        unit: number;
        rows: number;
        columns: number;
        lerpProgress: number

        constructor(align: Function, x: number, y: number, x2: number, y2: number, time: number, frame: Image) {
            let unit = Math.floor(frame.width / 3);
            let points: number[][] = align(unit, x, y, x2, y2);
            this.pt1 = points[0]; this.pt2 = points[1];
            this.resize(x, y, x2, y2, time, frame);
            console.log([this.pt1[0], this.pt1[1], this.pt2[0], this.pt2[1]]);
        }

        resize(x1: number, y1: number, x2: number, y2: number, time?: number, frame?: Image) {
            this.ptTarget1 = [Math.floor(x1), Math.floor(y1)];
            this.ptTarget2 = [Math.floor(x2), Math.floor(y2)];
            this.frame = frame || assets.image`defaultFrame`;
            this.unit = Math.floor(this.frame.width / 3);
            let width = this.pt2[0] - this.pt1[0];
            let height = this.pt2[1] - this.pt1[1];
            this.columns = Math.floor(width / this.unit);
            this.rows = Math.floor(height / this.unit);
            this.image = image.create(x1 + width, y1 + height);
            this.calculateSlices();
            this.lerpProgress = 0;
            this.draw();
        }

        update() {
            if (this.lerpProgress == null || this.updateLerp()) {
                let width = this.pt2[0] - this.pt1[0];
                let height = this.pt2[1] - this.pt1[1];
                this.columns = Math.floor(width / this.unit);
                this.rows = Math.floor(height / this.unit);
                this.image = image.create(Math.round(this.pt1[0] + width),
                    Math.round(this.pt1[1] + height));
                this.draw();
                //console.log("draw!")
            }
        }

        updateLerp() {
            this.lerpProgress += (1 - this.lerpProgress) / 150;
            this.pt1[0] = lerp(this.pt1[0], this.ptTarget1[0], this.lerpProgress);
            this.pt1[1] = lerp(this.pt1[1], this.ptTarget1[1], this.lerpProgress);
            this.pt2[0] = lerp(this.pt2[0], this.ptTarget2[0], this.lerpProgress);
            this.pt2[1] = lerp(this.pt2[1], this.ptTarget2[1], this.lerpProgress);
            console.log([this.ptTarget1[0] - this.pt1[0], this.ptTarget1[1] - this.pt1[1],
                this.ptTarget2[0] - this.pt2[0], this.ptTarget2[0] - this.pt2[0]]);

            if ((Math.abs(this.ptTarget1[0] - this.pt1[0]) < .5) && (Math.abs(this.ptTarget1[1] - this.pt1[1]) < .5) &&
                (Math.abs(this.ptTarget2[0] - this.pt2[0]) < .5) && (Math.abs(this.ptTarget2[1] - this.pt2[1]) < .5)) {
                this.lerpProgress = null;
                    this.pt1[0] = this.ptTarget1[0]; this.pt1[1] = this.ptTarget1[1];
                    this.pt2[0] = this.ptTarget2[0]; this.pt2[1] = this.ptTarget2[1];
                    return(false);
                } else return(true);

        }

        protected calculateSlices() {
            this.nineSlice = [];
            for (let i = 0; i < 9; i++) {
                this.nineSlice.push(image.create(this.unit, this.unit))
                this.drawPartial(this.nineSlice[i], 0, 0, i, this.unit, this.unit);
            }
        }

        draw() {
            let x1 = Math.round(this.pt1[0]); let x2 = Math.round(this.pt2[0]);
            let y1 = Math.round(this.pt1[1]); let y2 = Math.round(this.pt2[1]);
            let edgeX = x2 - this.unit;
            let edgeY = y2 - this.unit;

            for (let c = 2; c < this.columns; c++) {
                this.image.drawTransparentImage(this.nineSlice[1], x1 + ((c - 1) * this.unit), y1);
                this.image.drawTransparentImage(this.nineSlice[7], x1 + ((c - 1) * this.unit), edgeY);
            }
            this.drawPartial(this.image, x1 + ((this.columns - 1) * this.unit),
                y1, 1, this.image.width - ((this.columns * this.unit) + x1), this.unit);
            this.drawPartial(this.image, x1 + ((this.columns - 1) * this.unit),
                edgeY, 7, this.image.width - ((this.columns * this.unit) + x1), this.unit);

            for (let r = 2; r < this.rows; r++) {
                this.image.drawTransparentImage(this.nineSlice[3], x1, y1 + ((r - 1) * this.unit));
                this.image.drawTransparentImage(this.nineSlice[5], edgeX, y1 + ((r - 1) * this.unit));
            }
            this.drawPartial(this.image, x1, y1 + ((this.rows - 1) * this.unit),
                3, this.unit, this.image.height - ((this.rows * this.unit) + y1));
            this.drawPartial(this.image, edgeX, y1 + ((this.rows - 1) * this.unit),
                5, this.unit, this.image.height - ((this.rows * this.unit) + y1));

            //Edges
            this.image.drawTransparentImage(this.nineSlice[0], x1, y1);
            this.image.drawTransparentImage(this.nineSlice[2], edgeX, y1);
            this.image.drawTransparentImage(this.nineSlice[6], x1, edgeY);
            this.image.drawTransparentImage(this.nineSlice[8], edgeX, edgeY);

            this.image.fillRect(
                this.unit + x1, this.unit + y1, edgeX - x1 - this.unit, edgeY - y1 - this.unit,
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

        setFrame(frame: Image) {
            this.frame = frame;
            this.calculateSlices();
            this.draw();
        }
    }

    export const Align = {
        topLeft: (unit: number, x: number, y: number, x2: number, y2: number): number[][] => {
            return ([[x, y], [unit, unit]]);
        },
        
        top: (unit: number, x: number, y: number, x2: number, y2: number): number[][] => {
            return ([[x, 0], [x2, unit]]);
        },

        left: (unit: number, x: number, y: number, x2: number, y2: number): number[][] => {
            return ([[x, y], [unit, y2]]);
        },

        middle: (unit: number, x: number, y: number, x2: number, y2: number): number[][] => {
            return ([[(x2 / 2) - unit, (y2 / 2) - unit], [(x2 / 2) + unit, (y2 / 2) + unit]])
        },
    }

    export function create(align: Function, x1: number, y1: number, x2: number, y2: number,
        time?: number, frame?: Image) {
        let box = new NineSliceBox(align, x1, y1, x2, y2,
            time || 0, frame || assets.image`defaultFrame`);

        scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
            if (controller.A.isPressed()) {
                box.resize(20, 10, 50, 35, 1, assets.image`myImage1`)
            }
            box.update();
            screen.drawTransparentImage(box.image, 0, 0);
        });

        return(box);
    }

    export function setFrame(box: NineSliceBox, frame: Image) {
        box.setFrame(frame);
    }

    export function resize(box: NineSliceBox, x1: number, y1: number, 
        x2: number, y2: number, time: number, frame: Image) {
        box.resize(x1, y2, x2, y2, time, frame);
    }

    function lerp(startValue: number, endValue: number, pct: number) {
        return (startValue + (endValue - startValue) * pct);
    }
}

/*class Dialog extends NineSliceBox {
    chunks: string[][];
    chunkIndex: number;

    constructor(x: number, y: number, width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
        super(x, y, width, height, frame, font, 15, cursor);

        this.chunkIndex = 0;
    }

    update(drawCursor = true) {
        this.drawTextCore();
        if (drawCursor) this.drawCursorRow();
    }

    hasNext() {
        if (!this.chunks || this.chunks.length === 0) return false;
        return this.chunkIndex < this.chunks.length - 1;
    }

    hasPrev() {
        if (!this.chunks || this.chunks.length === 0) return false;
        return this.chunkIndex > 0;
    }

    nextPage() {
        if (this.hasNext()) {
            this.chunkIndex++;
        }
    }

    prevPage() {
        if (this.hasPrev()) {
            this.chunkIndex--;
        }
    }

    chunkText(str: string): string[][] {
        const charactersPerRow = Math.floor(this.textAreaWidth() / this.font.charWidth);
        const charactersPerCursorRow = Math.floor(charactersPerRow - (this.cursor.width / this.font.charWidth));
        const rowsOfCharacters = Math.floor(this.textAreaHeight() / this.rowHeight());
        const rowsWithCursor = Math.ceil(this.cursor.height / this.rowHeight());

        let lineLengths: number[] = [];

        for (let j = 0; j < rowsOfCharacters - rowsWithCursor; j++) lineLengths.push(charactersPerRow);
        for (let k = 0; k < rowsWithCursor; k++) lineLengths.push(charactersPerCursorRow);

        return this.breakIntoPages(str, lineLengths);
    }

    setText(rawString: string) {
        this.setFont(image.getFontForText(rawString));
        this.chunks = this.chunkText(rawString);
        this.chunkIndex = 0;
    }

    drawTextCore() {
        if (!this.chunks || this.chunks.length === 0) return;
        const lines = this.chunks[this.chunkIndex];
        const availableWidth = this.textAreaWidth();
        const availableHeight = this.textAreaHeight();

        const charactersPerRow2 = Math.floor(availableWidth / this.font.charWidth);
        const rowsOfCharacters2 = Math.floor(availableHeight / this.rowHeight());

        if (this.unit > MAX_FRAME_UNIT) this.draw();

        const textLeft = 1 + this.innerLeft + Math.min(this.unit, MAX_FRAME_UNIT) + ((availableWidth - charactersPerRow2 * this.font.charWidth) >> 1);
        const textTop = 1 + (this.image.height >> 1) - ((lines.length * this.rowHeight()) >> 1);

        for (let row = 0; row < lines.length; row++) {
            this.image.print(
                lines[row],
                textLeft,
                textTop + row * this.rowHeight(),
                this.textColor, this.font
            )
        }
    }

    protected setFont(font: image.Font) {
        this.font = font;
    }

    breakIntoPages(text: string, lineLengths: number[]): string[][] {
        const result: string[][] = [];

        let currentPage: string[] = [];

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;
        let lineLength = lineLengths[line];

        function nextLine() {
            line++;
            lineLength = lineLengths[line];
        }

        for (let index = 0; index < text.length; index++) {
            if (text.charAt(index) === "\n") {
                currentPage.push(this.formatLine(text.substr(lastBreak, index - lastBreak)));
                index++;
                lastBreak = index;
                nextLine();
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(index) === "\\" && text.charAt(index + 1) === "n") {
                currentPage.push(this.formatLine(text.substr(lastBreak, index - lastBreak)));
                index += 2;
                lastBreak = index
                nextLine();
            }
            else if (this.isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === lineLength) {
                if (lastBreakLocation === index || lastBreakLocation < lastBreak) {
                    currentPage.push(this.formatLine(text.substr(lastBreak, lineLength)));
                    lastBreak = index;
                    nextLine();
                }
                else {
                    currentPage.push(this.formatLine(text.substr(lastBreak, lastBreakLocation - lastBreak)));
                    lastBreak = lastBreakLocation;
                    nextLine();
                }
            }

            if (line >= lineLengths.length) {
                line = 0;
                lineLength = lineLengths[line];
                result.push(currentPage);
                currentPage = [];
            }
        }

        currentPage.push(this.formatLine(text.substr(lastBreak, text.length - lastBreak)));

        if (currentPage.length > 1 || currentPage[0] !== "") {
            result.push(currentPage);
        }

        return result;
    }

    formatLine(text: string) {
        let l = 0;
        while (text.charAt(l) === " ") l++;
        return text.substr(l, text.length);
    }

    isBreakCharacter(charCode: number) {
        return charCode <= 32 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126) ||
            (charCode >= 19968 && charCode <= 40869) ||
            charCode == 12290 ||
            charCode == 65292;
    }

    protected drawCursorRow() {
        let offset = 0;
        if (this.cursorCount > 40) {
            offset = 1;
        }

        this.cursorCount = (this.cursorCount + 1) % 80;

        this.image.drawTransparentImage(
            this.cursor,
            this.innerLeft + this.textAreaWidth() + this.unit + offset - this.cursor.width,
            this.innerTop + this.unit + this.textAreaHeight() + 1 - this.cursorRowHeight()
        )
    }

    //
    protected cursorRowHeight() {
        return this.cursor.height + 1;
    }

    protected rowHeight() {
        return this.font.charHeight + 1;
    }

    protected textAreaWidth() {
        return this.image.width - ((this.innerLeft + Math.min(this.unit, 12)) << 1) - 2;
    }

    protected textAreaHeight() {
        return this.image.height - ((this.innerTop + Math.min(this.unit, 12)) << 1) - 1;
    }
}*/



let dialog = nineSlice.create(nineSlice.Align.left, 0, 0, 150, 120, 1, assets.image`myImage1`);
//let nineSlice = new NineSliceBox(0, 0, 100, 100, assets.image`myImage`);

let dem = [
    0,
    0,
    20,
    20
]
dialog.update();

/*let lerpProgress = 0;
let x1 = 160 / 2;
let y1 = 120 - 70;
let x2 = 160 / 2;
let y2 = 120;
let x1Target = 0;
let x2Target = 160;*/

scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
    /*if (controller.A.isPressed()) {
        lerpProgress = 0;
        x1 = 160 / 2;
        y1 = 120 - 70;
        x2 = 160 / 2;
        y2 = 120;
        x1Target = 0;
        x2Target = 160;
    }
    lerpProgress = (1 - lerpProgress) / 10;
    x1 = lerp(x1, x1Target, lerpProgress);
    x2 = lerp(x2, x2Target, lerpProgress);*/

    //dialog.resize(x1, y1, x2, y2, 1, assets.image`myImage2`);

});




/*scene.createRenderable(0, (target: Image, camera: scene.Camera) => {
    if (controller.A.isPressed()) {
        dem[0] += Math.floor(controller.dx());
        dem[1] += Math.floor(controller.dy());
    } else {
        dem[2] += Math.floor(controller.dx());
        dem[3] += Math.floor(controller.dy());
    }
    //nineSlice.resize(dem[0], dem[1],assets.image`myImage`, undefined);
    //dialog.setText("Hello There!\n>Hello!<");
    dialog.resize(dem[0], dem[1], dem[2], dem[3],assets.image`myImage2`);
    dialog.update(false);
    target.drawTransparentImage(dialog.image, 0, 0);
    console.log([dialog.image.width, dialog.image.height, dem[3]]);
});*/
