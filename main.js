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

colorings = {
    'help': "#009966",
    'hello': "#ccff33",
    'open': "#00ff00",
    'clear': "#00ffff",
    'bye':  "#ff0000",
    'quit':  "#ff0000",
    'self-destruct': "#cc9900",
    'cd':   "#009999",
    'ls':   "#00cc66",
    'explode': "#ff0000",
    '!!!!': "010101"
}

function update_text() {
    for(let i = 0; i < input.text.length; i++) {
        input.addColor('ffffff',i)
    }
    var last_index = 0
    for(let i = 0; i <= 50; i++) {
        for(i in colorings) {
            var index = input.text.indexOf(i,last_index+1)
            if(index > -1) {   
                input.addColor(colorings[i], index)
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
    }
}

function launch_input() {
    input.anchor.setTo(0.5,0.5)
    input.body.static = false
    input.body.setRectangle(input.width, input.height, 0, 0, 0) 

    input.body.velocity.x = 0
    input.body.velocity.y = 1000
    input.body.angularVelocity = 0
    input.body.collideWorldBounds = true
    input.body.bounce = 10
    input.checkWorldBounds = true
    
    prevs.add(input)
    reset_input()
}

function randInt(m) {
    return Math.floor(Math.random() * m);
}

function randDir() {
    return (randInt(2) * 2) - 1
}

command_maps = {
    "help": help,
    "hello": hello,
    "open": open,
    "clear": clear,
    "bye": quit,
    "quit": quit,
    "self-destruct": explode,
    "explode": explode,
    "cd": cd,
    "ls": ls
}

function process_input() {
    inpt = input.text.split(" ")
    inpt.shift() // remove the header word
    cmd = inpt.shift()
    has = false
    cmd_found = null
    for(var i in command_maps) {
        if(i == cmd) {
            has = true
            cmd_found = command_maps[i]
            break
        }
    }

    if(has) {
        cmd_found(inpt)
    }
}

function help(inpt) {
    create_output_text("AVALIABLE COMMANDS:", "#ccccff")
    create_output_text("cd [dir]","#009999")
    create_output_text("ls","#00cc66")
    create_output_text("open","#00ff00")
    create_output_text("clear","#00ffff")
    create_output_text("bye","#ff0000")
    create_output_text('hello', "#ccff33")
    create_output_text('explode', "#ff0000")
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
    })
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
    
    emitter.gravity = 0;
    emitter.start(false, 1000, 20);
}

function update_explode() {
    for(var i in exploder_emitters) {
        exploder_emitters[i].x = exploders[i].x
        exploder_emitters[i].y = exploders[i].y
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