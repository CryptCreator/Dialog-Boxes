
scene.setBackgroundColor(0)

let MAX_FRAME_UNIT = 12
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

    update(drawCursor = true) {
        this.draw();
        if (drawCursor) this.drawCursorRow();
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
}
class Dialog extends NineSliceBox {
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
}

let dialog = new Dialog(0, 0, 100, 100, assets.image`myImage`);
let nineSlice = new NineSliceBox(0, 0, 100, 100, assets.image`myImage`);


let dem = [
0,
0,
20,
20
]
let pressed = [0, 0]
dialog.update();
dialog.setText("a a a a a a a a a a a a a a a");
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
    dialog.setText("Hello There!\n>Hello!<");
    dialog.resize(dem[0], dem[1], dem[2], dem[3],assets.image`myImage2`);
    dialog.update(false);
    target.drawTransparentImage(dialog.image, 0, 0);
    //game.showLongText
});
