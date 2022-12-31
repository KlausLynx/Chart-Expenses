const context = document.getElementById('chart');
const chartWrapper = document.getElementById('chart-wrapper');

class Chart {
  static OFFSET = 20;

  constructor(canvas, width = 0, height = null) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  async loadData(address) {
    const data = await fetch(address);
    const json = await data.json();

    this.data = json;
  }

  getWith() {
    return this.canvas.width;
  }

  getHeight() {
    return this.canvas.height;
  }

  setWidth(width) {
    this.canvas.width = width;
  }

  setHeight(height) {
    this.canvas.height = height;
  }

  generateBars(gapPx) {
    this.bars = [];
    let width = Math.round((this.getWith() - 30 - (this.data.length - 1) * gapPx) / this.data.length);
    let maxValue = Math.max(...this.data.map(o => o.amount),0);
    
    let availableHeight = this.getHeight() - Chart.OFFSET - 60;

    for(let i = 0; i < this.data.length; i++) {
      let barHeight = Math.round(this.data[i].amount / maxValue * availableHeight);
      this.bars.push(
        new Bar(
          i * (width + gapPx) + 15,
          this.getHeight() - 20 - barHeight,
          width,
          barHeight,
          "hsl(10, 79%, 65%)",
          "hsl(10, 79%, 77%)",
          this.data[i].day,
          "$ " + this.data[i].amount
        )
      )
    }

    this.bars[2].color = 'hsl(186, 34%, 60%)';
    this.bars[2].hoverColor = 'hsl(186, 34%, 70%)';
  }

  getMousePosition(event) {
    let rect = this.canvas.getBoundingClientRect();
     
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      lx: event.clientX - rect.left - event.movementX,
      ly: event.clientY - rect.top - event.movementY,
     }
  }

  isMouseOverElement(event) {
    let mousePosition = this.getMousePosition(event);
    
    this.bars.forEach(bar => {
      if(
        mousePosition.x >= bar.posX && 
        mousePosition.x <= (bar.posX + bar.width) &&
        mousePosition.y >= bar.posY &&
        mousePosition.y <= bar.posY + bar.height
      ) {
        bar.drawBar(this.canvas.getContext('2d'), bar.hoverColor);
        bar.drawValue(this.canvas.getContext('2d'), this.getHeight());
        this.canvas.style.cursor = 'pointer';
      } else if (
        mousePosition.lx >= bar.posX && 
        mousePosition.lx <= (bar.posX + bar.width) &&
        mousePosition.ly >= bar.posY &&
        mousePosition.ly <= bar.posY + bar.height
      ) {
        bar.drawBar(this.canvas.getContext('2d'), bar.color);
        this.canvas.getContext('2d').clearRect(bar.posX - 10, bar.posY - 60, bar.width + 20, 50);
        this.canvas.style.cursor = 'inherit';
      }
    });
  }
}

class Bar {
  constructor(posX, posY, width, height, color, hoverColor, label, value) {
    this.width = width;
    this.height = height;
    this.posX = posX;
    this.posY = posY;
    this.color = color;
    this.hoverColor = hoverColor;
    this.label = label;
    this.value = value;
  }

  drawBar (context, color) {
    context.fillStyle = color;
    // context.beginPath();
    // context.roundRect(this.posX, this.posY, this.width, this.height, 10);
    // context.fill();
    this.roundRect(context, this.posX, this.posY, this.posX + this.width, this.posY + this.height, 10);
    this.drawLabel(context);
  }

  drawLabel (context, height) {
    context.fillStyle = 'hsl(28, 10%, 53%)';
    context.font = "1rem 'DM Sans'";
    let offset = Math.round((this.width - context.measureText(this.label).width) / 2);
    context.fillText(this.label, this.posX + offset, height, this.width);
  }

  drawValue(context, height) {
    context.fillStyle = 'hsl(25, 47%, 15%)';
    context.font = "1rem 'DM Sans'";
    
    //context.beginPath();
    //context.roundRect(this.posX-10, this.posY - 40, this.width+ 20, 30, 10);
    this.roundRect(context, this.posX-10, this.posY - 40, this.posX-10+ this.width+ 20, this.posY - 40 + 30, 10)
    context.fill();

    let offset = Math.round((this.width - context.measureText(this.value).width) / 2);
    context.fillStyle = 'hsl(27, 66%, 92%)';
    context.fillText(this.value, this.posX + offset, this.posY - 20, this.width, 50);  
  }

  roundRect(context, x, y, w, h, r) {
    var width = w - x;
    var height = h - y;
    if (r > width/2) r = width/2;
    if (r > height/2) r = height/2;
    context.beginPath();
    context.moveTo(w - r, y);
    context.quadraticCurveTo(w, y, w, y + r);
    context.lineTo(w, h-r);
    context.quadraticCurveTo(w, h, w - r, h);
    context.lineTo(x + r, h);
    context.quadraticCurveTo(x, h, x, h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
    context.fill();
  }
}

async function init(chart) {
  await chart.loadData('./data.json');
  chart.setWidth(chartWrapper.clientWidth); 
  let context = chart.canvas.getContext('2d');
  chart.generateBars(10);
  chart.bars.forEach(bar => {
    bar.drawBar(context, bar.color);
    bar.drawLabel(context, chart.getHeight());
  });
}

let chart = new Chart(context, chartWrapper.clientWidth, window.innerHeight * 0.30);
init(chart);

window.addEventListener("resize", (e) => {
  chart.setWidth(chartWrapper.clientWidth);
  
  let context = chart.canvas.getContext('2d');
  chart.generateBars(10);
  chart.bars.forEach(bar => {
    bar.drawBar(context, bar.color);
    bar.drawLabel(context, chart.getHeight());
  });
});

context.addEventListener('mousemove', (event) => {
  chart.isMouseOverElement(event); 
});