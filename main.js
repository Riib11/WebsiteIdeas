var adjusty = 20
var adjustx = 10

var game = new Phaser.Game(window.innerWidth-adjustx, window.innerHeight-adjusty, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update });

window.onresize = function() {
    game.width = window.innerWidth-adjustx
    game.height = window.innerHeight-adjusty
}

var fontsize = 30

var input = null
var current_dir = "index/"
var header = '[' + current_dir + '] '

function update_header() {
    header = '[' + current_dir + '] '
}

function preload() {
    game.load.image('explosion_particle1', 'assets/explosion_particle1.png')
    game.load.image('explosion_particle2', 'assets/explosion_particle2.png')
    game.load.image('explosion_particle3', 'assets/explosion_particle3.png')

    game.load.image('obj1', 'assets/obj1.png')
    game.load.image('obj2', 'assets/obj2.png')
    game.load.image('obj3', 'assets/obj3.png')

    game.load.image('water1', 'assets/water1.png')
    game.load.image('water2', 'assets/water2.png')
    game.load.image('water3', 'assets/water3.png')

    game.stage.backgroundColor = "#000000";
    game.input.keyboard.addCallbacks(null, key_press);
    init_acceptable()
}

prevs = null

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000;

    reset_input()

    prevs = game.add.group()
}

function update() {
    update_explode()
    update_water()
}

var acceptable = []

function init_acceptable() {
    acceptable = String(document.getElementById('acceptable').innerHTML).split('')
}

function contains(arr,val) {
    return arr.indexOf(val) > -1
}

function contains_key(dic,key) {
    for(var i in dic) {
        if(i == key) {
            return true
        }
    }
    return false
}

function key_press(ke) {
    if(ke.key == "Backspace") {
        if(input.text.length > header.length)
        input.text = input.text.slice(0,input.text.length-1)
    } else if(ke.key == "Enter") {
        process_input()
        launch_input()
    } else if(!contains(acceptable, ke.key)) {
        // do nothing
    } else {
        input.text += ke.key
    }
    update_text()
}

function reset_input() {
    input = game.add.text(game.width/4, game.height/2, header + "", { font: "30px Courier", fill: "#FFFFFF", align: "left" });
    input.anchor.setTo(0.5,0.5)
    game.physics.p2.enable(input)
    input.body.static = true
}

function update_text() {
    for(let i = 0; i < input.text.length; i++) {
        input.addColor('ffffff',i)
    }
    var last_index = 0
    for(let i = 0; i <= 50; i++) {
        for(i in commands) {
            var index = input.text.indexOf(i,last_index+1)
            if(index > -1) {   
                input.addColor(commands[i][0], index)
                input.addColor('#ffffff', index + i.length)    
                last_index = index
            }
        }

        var dir = ""
        if(current_dir == "index/") {
            dir = content["index/"]
        } else {
            dir = content["index/"][current_dir]
        }

        for(c in dir) {
            var index = input.text.indexOf(c,last_index+1)
            if(index > -1) {   
                input.addColor("#FFFF00", index)
                input.addColor('#ffffff', index + c.length)    
                last_index = index
            }
        }

        if(input.text.indexOf("..") > -1) {
            var index = input.text.indexOf("..")
            input.addColor("#FFFF00",index)
            input.addColor("#FFFFFF",index+2)
        }
    }
}

function launch_input() {
    input.anchor.setTo(0.5,0.5)
    input.body.static = false
    input.body.setRectangle(input.width, input.height, 0, 0, 0) 

    // input.body.velocity.x = 0
    // input.body.velocity.y = 1000
    input.body.angularVelocity = 0
    input.body.collideWorldBounds = true
    input.body.bounce = 10
    input.checkWorldBounds = true
    input.events.onOutOfBounds.add( function(obj) { obj.kill() }, this );
    
    prevs.add(input)
    reset_input()
}

function randInt(m) {
    return Math.floor(Math.random() * m);
}

function randDir() {
    return (randInt(2) * 2) - 1
}

function process_input() {
    inpt = input.text.split(" ")
    inpt.shift() // remove the header word
    cmd = inpt.shift()
    has = false
    cmd_found = null
    for(var i in commands) {
        if(i == cmd) {
            has = true
            cmd_found = commands[i][2]
            break
        }
    }

    if(has) {
        cmd_found(inpt)
    }
}

function help(inpt) {
    create_output_text("AVALIABLE COMMANDS:", "#ccccff")
    for(var i in commands) {
        create_output_text(commands[i][1],commands[i][0])
    }
}

var hello_speed = 100
var hello_count = 0

function hello(inpt) {
    var txt = "hello! how are you"

    for(var i = 0; i <= hello_count; i++) {
        txt += "?"
    }

    var disp = create_output_text(txt,"#FF00FF")
    disp.body.data.gravityScale = 0;
    disp.body.velocity.y = hello_speed
    disp.body.velocity.x = -hello_speed
    prevs.add(disp)
    
    hello_speed *= 2
    hello_count += 1
}

function open(inpt) {
    var dir = ""
    if(current_dir == "index/") {
        dir = content["index/"]
    } else {
        dir = content["index/"][current_dir]
    }

    if(contains_key(dir,inpt[0])) {
        console.log("opening " + inpt[0])
        create_open_button(inpt[0],dir[inpt[0]])
    }
}

function clear(inpt) {
    prevs.forEach(function(i) {
        i.body.collideWorldBounds = false
        i.body.data.gravityScale = 10;
        i.body.static = false
    })
    water_num = 0
    water_counter = 0
    water_on = false
}

function quit(inpt) {
    t = create_output_text("goodbye...","#FF0000")
    t.body.angularVelocity = 100
    t.body.velocity.x = -1000
}

exploders = []
exploder_emitters = []

function explode(inpt) {
    emitter = game.add.emitter(0, 0, 1000);
    emitter.makeParticles(['explosion_particle1','explosion_particle2','explosion_particle3']);

    exploders = exploders.concat(input)
    exploder_emitters = exploder_emitters.concat(emitter)
    
    emitter.gravity = 1;
    emitter.start(false, 10000, 5);
}

function update_explode() {

    for(var i in exploder_emitters) {
        if(exploders[i].alive) {
            exploder_emitters[i].x = exploders[i].x
            exploder_emitters[i].y = exploders[i].y
        } else {
            exploder_emitters[i].on = false
        }
    }
}

function cd(inpt) {
    if(current_dir == "index/") {
        if(contains_key(content["index/"],inpt[0])) {
            if(typeof(content["index/"][inpt[0]]) != "string") {
                current_dir = inpt[0]
                update_header()
            } else {
                create_output_text("[!] '" + inpt[0] + "' is not a directory", "#FF0000")
            }
        } else {
            create_output_text("[!] no directory '" + inpt[0] + "'", "#FF0000")
        }
    } else {
        if(inpt[0] == "..") {
            current_dir = "index/"
            update_header()
        } else {
            create_output_text("[!] no directory '" + inpt[0] + "'", "#FF0000")
        }
    }
}

function ls(inpt) {
    var dir = ""
    if(current_dir == "index/") {
        dir = content["index/"]
    } else {
        dir = content["index/"][current_dir]
    }


    var border = "+------" + current_dir + "-------+"
    var txt = border
    for(var i in dir) {
        if(txt == border) {
            txt += "\n+ " + i
        } else {
            txt += "\n+ " + i
        }
    }

    create_output_text(txt,"#FFFF00")
}

function gravity(inpt) {
    game.physics.p2.gravity.y *= -1;
}

function objects(inpt) {
    for(var i = 1; i <= 3; i++) {
        var o = create_output_sprite("obj" + String(i))
        o.body.clearShapes()
        o.body.addCircle(25+(12.5 * (i-1)))
        prevs.add(o)
        o.x += (i - 2) * 100
        o.y += (i - 1) * 100
    }
}


var frozen = false
function freeze(inpt) {
    if(frozen) {
        prevs.forEach(function(obj) {
            obj.body.static = false
        }, this)
        frozen = false
    } else {
        prevs.forEach(function(obj) {
            obj.body.velocity.x = 0
            obj.body.velocity.y = 0
            obj.body.static = true
        }, this)
        frozen = true
    }    
}


var water_on = false
function water(inpt) {
    if(water_on) {
        // turn off water
        // water_on = false
    } else {
        // turn on water
        water_on = true
    }
}

var water_delay = 1
var water_counter = 0
var max_water = 100
var water_num = 0
function update_water() {
    if(water_on & water_num <= max_water) {
        water_counter += 1
        if(water_counter >= water_delay) {
            i = randInt(3) + 1
            var w = game.add.sprite(10, 100, 'water' + String(i))
            game.physics.p2.enable(w)
            w.anchor.setTo(0.5,0.5)
            w.body.collideWorldBounds = true
            w.body.bounce = 10
            w.checkWorldBounds = true
            w.body.data.gravityScale = 0.1;
            w.body.velocity.x = 100 + ((Math.random() * 200) * randDir())
            prevs.add(w)
            water_num += 1
            water_counter = 0
        }
    }
}

function create_output_text(txt,fill) {
    var disp = game.add.text(game.width/4 * 3, 50, txt, { font: "30px Courier", fill: fill, align: "left" })
    game.physics.p2.enable(disp)
    disp.anchor.setTo(0.5,0.5)
    disp.body.collideWorldBounds = true
    disp.body.bounce = 10
    disp.checkWorldBounds = true
    prevs.add(disp)

    return disp
}

function create_output_sprite(name) {
    var disp = game.add.sprite(game.width/4 * 3, 100, name)
    game.physics.p2.enable(disp)
    disp.anchor.setTo(0.5,0.5)
    disp.body.collideWorldBounds = true
    disp.body.bounce = 10
    disp.checkWorldBounds = true
    prevs.add(disp)

    return disp
}

function create_open_button(name, url) {

    function openurl() {
        alert("this is not yet implemented, sorry")
    }

    t = "| open " + name + " |"
    b = "+"
    for(var i = 0; i < t.length-2; i++) {
        b += "-"
    }
    b += "+"

    btn = create_output_text(b + "\n" + t + "\n" + b,'#00FFFF')
    btn.inputEnabled = true
    btn.events.onInputDown.add(openurl,this)
}

commands = {
    'help': ["#009966", 'help', help],
    'hello': ["#ccff33", 'hello', hello],
    'open': ["#00FF00", "open [file]", open],
    'clear': ["#00ffff", "clear", clear],
    'bye': ["#ff0000", "bye", quit],
    'quit': ["#ff0000", "quit", quit],
    'self-destruct': ["#cc9900", "self-destruct", explode],
    'cd': ["#009999", "cd [dir]", cd],
    'ls': ["#00cc66", "ls", ls],
    'explode': ["#ff0000", "explode", explode],
    'gravity': ["#339933", "gravity", gravity],
    'objects': ["#FF00FF", "objects", objects],
    'freeze': ["#66ccff", "freeze", freeze],
    'water': ["#0000FF", "water", water],
}