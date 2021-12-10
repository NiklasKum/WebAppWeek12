
/*
Author: Niklas Kumpulainen
st.nm: 0567737
date:9.12.2021

Note: All assets used are either from phaser io assets database which are ok to use in demos such as this application or self made assets
Alot of code is written by reference to the phaser 3 examples. 
Sources:


*/

window.onload = function(){
    

    var config = {
        type: Phaser.WEBGL,
        width: 1200,
        height: 800,
        backgroundColor: "#6E90BA",
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);


    
    function preload ()
    {
        this.load.image('tiles', 'http://labs.phaser.io/assets/textures/tiles.jpg');
        this.load.image('block', "http://labs.phaser.io/assets/sprites/50x50-white.png");
    }
    //source: https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;
    
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }
    
        return arr;
    }
    function translateCoordToIndex(coord){
        return (coord-25)/50;
    }
    var GameWidth = 1200;
    var GameHeight = 800;
    var player1;
    var player2;
    var walls;
    const gametiles = createArray(24, 16);
    var RedTileCounter = 0;
    var BlueTileCounter = 0;
    var timetext;
    var bluetext;
    var redtext;
    var gameMaxTime = 60;
    var gameTime;
    var timeevent
    var gamehasended = false;
    var gamehasstarted = false;
    var blocker;
    var tutorialtext;


    function create ()
    {
        gamehasstarted = false;
        gamehasended = false;
        var ballred = [
            '.....33.....',
            '...334433...',
            '..32433333..',
            '.3243333333.',
            '.3433333333.',
            '343333333333',
            '343333333333',
            '.3333333333.',
            '.3333333333.',
            '..33333333..',
            '...333333...',
            '.....33.....'
        ];

        var ballblue = [
            '.....EE.....',
            '...EEFFEE...',
            '..E2FEEEEE..',
            '.E2EEEEEEEE.',
            '.EFEEEEEEEE.',
            'EFEEEEEEEEEE',
            'EFEEEEEEEEED',
            '.EEEEEEEEED.',
            '.EEEEEEEEED.',
            '..EEEEEEED..',
            '...EEEEDD...',
            '.....ED.....'
        ];
        walls = this.physics.add.staticGroup();
        
       
        this.textures.generate("balloon1", {data: ballred, pixelWidth: 4, pixelHeight: 4});
        this.textures.generate("balloon2", {data: ballblue, pixelWidth: 4, pixelHeight: 4});
        player1 = this.add.sprite(50,50, "balloon1");
        player2 = this.add.sprite(GameWidth-50,GameHeight-50, "balloon2");
        initiGame();
        
        //player.body.setCollideWorldBounds(true);
        //player.setBounce(0.2);
        this.physics.add.existing(player1, false);
        this.physics.add.existing(player2, false);
        player1.body.setCollideWorldBounds(true);
        player2.body.setCollideWorldBounds(true);

        this.physics.add.overlap(player1, walls, colorTileRed);
        this.physics.add.overlap(player2, walls, colorTileBlue);

        //player.setTint(0x42f569);
        
        
       timetext = this.add.text(GameWidth/2, 20, 'TIME').setFontFamily('Arial').setFontSize(40).setBackgroundColor(0xffffff);
       var redtextconfig = {
            x: GameWidth/2-150, 
            y: 20,
            text: 'Red: ',
            style: {
                fontSize: '35px',
                fontFamily: 'Arial',
                color: '#ff0000',
                align: 'left',
                backgroundColor: '#000000',
                shadow: {
                    color: '#000000',
                    fill: true,
                    offsetX: 2,
                    offsetY: 2,
                    blur: 8
                }
            }
        };
        redtext = this.make.text(redtextconfig);
        var bluetextconfig = {
            x: GameWidth/2+150,
            y: 20,
            text: 'Blue: ',
            style: {
                fontSize: '35px',
                fontFamily: 'Arial',
                color: '#0000ff',
                align: 'right',
                backgroundColor: '#000000',
                shadow: {
                    color: '#000000',
                    fill: true,
                    offsetX: 2,
                    offsetY: 2,
                    blur: 8
                }
            }
        };
        bluetext = this.make.text(bluetextconfig);
        cursors1 = this.input.keyboard.addKeys({
            up1: Phaser.Input.Keyboard.KeyCodes.W,
            left1: Phaser.Input.Keyboard.KeyCodes.A,
            down1: Phaser.Input.Keyboard.KeyCodes.S,
            right1: Phaser.Input.Keyboard.KeyCodes.D,
        })
        cursors2 = this.input.keyboard.createCursorKeys();

        this.input.on('pointerdown', function () {

            if(!gamehasstarted){
                //Destroy tutorial text
                //Initialize game clock
                tutorialtext.destroy();
                blocker.destroy();
                gameTime = gameMaxTime;
                timeevent = this.time.addEvent({ delay: 1000, callback: tick, callbackScope: this, loop: true });
                gamehasstarted = true;
            } else if(gamehasended){
                this.sys.game.destroy(true);
                document.addEventListener('mousedown', function newGame () {
                    game = new Phaser.Game(config);
                    document.removeEventListener('mousedown', newGame);
                });
            }
        }, this);

        blocker = this.add.rectangle(GameWidth/2,GameHeight/2,GameWidth,GameHeight, "#000000");
        blocker.depth = 450;

        var tutorialconfig = {
            x: 70,
            y: 100,
            text: 'Welcome to "Balloon conquest:\nthe ultimate local pvp experience!"\nTutorial:\nRed/Player 1 moves from WASD keys\nBlue/Player 2 moves from arrow keys\nThe player that manages to color most tiles wins\nYou have 60 seconds! Good luck!\n[Press click to start]\n\n(Game by Niklas Kumpulainen)',
            style: {
                fontSize: '50px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#fc03d7',
                shadow: {
                    color: '#000000',
                    fill: true,
                    offsetX: 2,
                    offsetY: 2,
                    blur: 8
                }
            }
        };
        tutorialtext = this.make.text(tutorialconfig);
        tutorialtext.depth = 500;
    }

    function initiGame(){
        
        for(x = 0; x < GameWidth/50; x++){
            for(y = 0; y < GameHeight/50; y++){
                walls.create(25+x*50, 25+y*50, "block");
                gametiles[x][y] = 0;
            }
        }
        walls.setTint(0xebe4e4)
        RedTileCounter = 0;
        BlueTileCounter = 0;
        player1.x = 50;
        player1.y = 50;
        player2.x = GameWidth-50;
        player2.y = GameHeight-50;
        player1.depth = 5;
        player2.depth = 5;
        
    }
    
    function tick(){
        gameTime--;
        var minutes = Math.floor(gameTime/60);
        var seconds = gameTime - (minutes*60);
        var timestring = addzeros(minutes)+":"+addzeros(seconds);
        timetext.text = timestring;
        if(gameTime < 0) {
            var i = decideWinner();
            if(i == 0){
                //draw
                blocker = this.add.rectangle(GameWidth/2,GameHeight/2,GameWidth,GameHeight, "#000000");
                blocker.depth = 450;
                var resultconfig = {
                    x: 300,
                    y: 100,
                    text: "DRAW!\nThank you for playing!\n[Press click to restart]",
                    style: {
                        fontSize: '60px',
                        fontFamily: 'Arial',
                        color: '#ffffff',
                        align: 'center',
                        backgroundColor: '#fc03d7',
                        shadow: {
                            color: '#000000',
                            fill: true,
                            offsetX: 2,
                            offsetY: 2,
                            blur: 8
                        }
                    }
                };
                resulttext = this.make.text(resultconfig);
                resulttext.depth = 500;
                var temp1 = this.add.sprite(GameWidth/2-100, 500, "balloon1");
                temp1.setScale(3);
                temp1.depth=460;
                var temp2 = this.add.sprite(GameWidth/2+100, 500, "balloon2");
                temp2.setScale(3);
                temp2.depth=460;
            } else if(i == 1){
                //player1 wins
                blocker = this.add.rectangle(GameWidth/2,GameHeight/2,GameWidth,GameHeight, "#000000");
                blocker.depth = 450;
                var resultconfig = {
                x: 175,
                y: 100,
                text: "Player 1 wins! Congratulations!\nThank you for playing!\n[Press click to restart]",
                style: {
                    fontSize: '60px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    align: 'center',
                    backgroundColor: '#d12435',
                    shadow: {
                        color: '#000000',
                        fill: true,
                        offsetX: 2,
                        offsetY: 2,
                        blur: 8
                        }
                    }
                };
                resulttext = this.make.text(resultconfig);
                resulttext.depth = 500;
                var temp = this.add.sprite(GameWidth/2, 500, "balloon1");
                temp.setScale(3);
                temp.depth=460;
            }else {
                //player2 wins
                blocker = this.add.rectangle(GameWidth/2,GameHeight/2,GameWidth,GameHeight, "#000000");

                blocker.depth = 450;
                var resultconfig = {
                    x: 175,
                    y: 100,
                    text: "Player 2 wins! Congratulations!\nThank you for playing!\n[Press click to restart]",
                    style: {
                        fontSize: '60px',
                        fontFamily: 'Arial',
                        color: '#ffffff',
                        align: 'center',
                        backgroundColor: '#0380fc',
                        shadow: {
                            color: '#000000',
                            fill: true,
                            offsetX: 2,
                            offsetY: 2,
                            blur: 8
                            }
                        }
                    };
                    resulttext = this.make.text(resultconfig);
                    resulttext.depth = 500;
                    var temp = this.add.sprite(GameWidth/2, 500, "balloon2");
                    temp.setScale(3);
                    temp.depth=460;
            }
            
            timeevent.remove(false);
            timetext.destroy();
        }
    }

    function addzeros(val){
        if(val < 10){
            return "0"+val;
        }
        return val;
    }

    function decideWinner(){
        gamehasended = true;
        if(RedTileCounter == BlueTileCounter){
            return 0;
        } else if(RedTileCounter > BlueTileCounter) {
            return 1
        } else {
            return 2
        }
        
    }

    function updateCountertxts(){
        redtext.text = "Red: "+RedTileCounter;
        bluetext.text = "Blue: "+BlueTileCounter;
    }

    function update(){
        player1.body.setVelocity(0);
        player2.body.setVelocity(0);
        if(gamehasstarted && !gamehasended){
            
            if (cursors1.left1.isDown)
            {
                player1.body.setVelocityX(-300);
            }
            else if (cursors1.right1.isDown)
            {
                player1.body.setVelocityX(300);
            }

            if (cursors1.up1.isDown)
            {
                player1.body.setVelocityY(-300);
            }
            else if (cursors1.down1.isDown)
            {
                player1.body.setVelocityY(300);
            }

            
            if (cursors2.left.isDown)
            {
                player2.body.setVelocityX(-300);
            }
            else if (cursors2.right.isDown)
            {
                player2.body.setVelocityX(300);
            }

            if (cursors2.up.isDown)
            {
                player2.body.setVelocityY(-300);
            }
            else if (cursors2.down.isDown)
            {
                player2.body.setVelocityY(300);
            }
            updateCountertxts();
        }
    }

    function colorTileRed(player, tile){
        coordX = translateCoordToIndex(tile.x);
        coordY = translateCoordToIndex(tile.y);

        if(gametiles[coordX][coordY] != 1){
            tile.setTint(0xff0000);
            if(gametiles[coordX][coordY] == 2){
                BlueTileCounter -= 1;
                //bluetext.setText("Blue: ",BlueTileCounter);
            }
            //console.log("coloring to red");

            //console.log("red -> x: ",coordX,",y: ",coordY);
            gametiles[coordX][coordY] = 1;
            RedTileCounter += 1;
            //redtext.setText("Red: ",RedTileCounter);
            
        }
    }
    function colorTileBlue(player, tile){
        
        coordX = translateCoordToIndex(tile.x);
        coordY = translateCoordToIndex(tile.y);
        
        if(gametiles[coordX][coordY] != 2){
            tile.setTint(0x0000ff);
            if(gametiles[coordX][coordY] == 1){
                RedTileCounter -= 1;
                //redtext.setText("Red: ",RedTileCounter);
            }
            //console.log("blue -> x: ",coordX,",y: ",coordY);
            //console.log("coloring to blue");
            gametiles[coordX][coordY] = 2;
            BlueTileCounter += 1;
            //bluetext.setText("Blue: ",BlueTileCounter);
            
        }
    }
    
}