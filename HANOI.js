let bars = []
let solveBars = []
let commands = []

let init = n => {
    bars.push(new Bar(0))
    bars.push(new Bar(1))
    bars.push(new Bar(2))

    for (let i = 0; i < 3 * n; i++) {
        bars[i % 3].push(new Disk(3 * n - i - 1))
    }

    let solveBars = Array.from(bars)
}

let move = (a, b) => {
   
    console.log(`moved ${a} to ${b}`)
    commands.push([a, b])
   
}

let hanoi = (a, b, c, m) => {
    if (m == 1){
        move(a, c)
    }
    else{
        hanoi(a, c, b, m-1)
        move(a, c)
        hanoi(b, a, c, m-1)
    }
}

let exHanoi = (a, b, c, n) => {


    if (n == 1) {
        move(c, b)
        move(a, c)
        move(b, a)
        move(b, c)
        move(a, c)
    } else {
        exHanoi(a, b, c, n-1)
        hanoi(c, a, b, 3*n-2)
        move(a, c)
        hanoi(b, a, c, 3*n-1)
    }
}


// ==========================================
// =================== p5 ===================
// ==========================================

let animationStack = []
let animationSpeed = 240
let state = 'no-animation'
let autoPlay = false;

let animationHandler = () => {
    if (state == 'animating' || !autoPlay || commands.length == 0) return

    let lastCommand = commands.pop()
    displace(lastCommand[0], lastCommand[1]) 
    state = 'animating' 
}



let run = (n) =>{
    
    exHanoi(0 ,1, 2, n)
    commands.reverse() 



}

let animation = (object, action, condition, data) => {
    return {
        object: object,
        action: action,
        condition: condition,
        data: data
    }
}

let createAnimation = (object, action, condition, data) => {
    animationStack.push(animation(object, action, condition, data))
}

let animations = () => {
    if (animationStack.length == 0 || state == 'no-animation') {
        state = 'no-animation'
        return state
    }

    let lastAnimation = animationStack.slice(-1)[0] 

   

    if (state == 'animating') {        
        if (!lastAnimation.condition(lastAnimation.object)) {
            if (animationStack.length == 1) {
                bars[lastAnimation.data.be].push(animationStack.pop().object)
                state = 'no-animation'
            } else {
                animationStack.pop()
                state = 'animating'
            }
        } else {
            lastAnimation.action(lastAnimation.object)
        }
    }

    return state
}

let displace = (az, be) => {
    if (bars[az].disks.length == 0) return "Can't move"
    
    state = 'animating'
    let disk = bars[az].pop()
    let direction = (disk.x > bars[be].x1 ? 'left' : 'right')

    let finalY = bars[be].freeY - disk.height / 2
    console.log(`finalY = ${finalY}`)

    
    animationStack.push(animation(
        disk,
        object => {
            object.move('down', animationSpeed)
            object.render()
        },
        object => {
            return object.y < finalY 
        },
        {
            az: az,
            be: be
        }
    ))
    
    animationStack.push(animation(
        disk,
        object => {
            let distance = Math.min(animationSpeed, Math.abs(bars[be].x1 - disk.x))
            object.move(direction, distance)
            object.render()
        },
        object => {
            return Math.abs(disk.x - bars[be].x1) > 0
        },
        {
            az: az,
            be: be
        }
    ))
    
    animationStack.push(animation(
        disk,
        object => {
            object.move('up', animationSpeed)
            object.render()
        },
        object => {
            return object.y > 30
        },
        {
            az: az,
            be: be
        }
    ))
}

class Disk {
    constructor(radius) {
        this.x = 0
        this.y = 0
        this.width = 6 * (radius-1) + 20
        this.height = 10
        this.radius = radius

        
    }

    move(direction, speed) {
        switch (direction) {
            case 'up':
                this.y -= speed
                break
            case 'down':
                this.y += speed
                break
            case 'right':
                this.x += speed
                break
            case 'left':
                this.x -= speed
                break
            default:
                break
        }
    }

    locate(x, y) {
        this.x = x
        this.y = y
    }

    render(){
        fill('cyan')
        rect(this.x, this.y, this.width, this.height)
    }
}

class Bar {
    constructor(index) {
        this.x1 = 0
        this.x2 = 0
        this.y1 = 0
        this.y2 = 0
        this.freeY = 0
        this.disks = []
        this.index = index        
    }

    update() {
        let offset = 0
        let gap = 0
        this.disks.forEach(disk => {
            disk.x = this.x1
            disk.y = this.y2 - disk.height / 2 - offset
            offset += disk.height + gap
        })
        this.freeY = this.y2 - offset
    }

    get(index) {
        return this.disks[index]
    }

    init(x1, y1, x2, y2) {
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
        this.update()
    }



    push(disk) {
        this.disks.push(disk)
        this.update()
    }

    pop() {
        return this.disks.pop()
        this.update()
    }

    render() {
        line(this.x1, this.y1, this.x2, this.y2)
        this.disks.forEach(disk => disk.render())
    }
}




function setup() {
    createCanvas(720, 400)
    init(3)
    bars[0].init(120, 50, 120, 380)
    bars[1].init(360, 50, 360, 380)
    bars[2].init(600, 50, 600, 380)
    run(3)
    rectMode(CENTER)
}
  
function draw() {
    
    background(color(50, 55, 100))
    bars.forEach(bar => bar.render())
    animations()
    animationHandler()

    
    
}

