// 整个是20x20的方格 行30 列30
var sw = 20,
    sh = 20,
    tr = 30,
    td = 30
//蛇的实例
//食物的实例
//游戏的实例
var snake = null,
   food = null,
   game = null
//方块构造函数 Square
//0,0		0,0
//20,0		1,0
//40,0		2,0
function Square(x,y,classname) {
  this.x = sw*x
  this.y = sh*y
  this.class = classname
  //方块对应的DOM元素
  this.viewcontent = document.createElement("div")
  //方块的父级
  this.parent = document.getElementById("snakeWrap")
  this.viewcontent.className = this.class
}
//prototype.create prototype.remove
//创建方块DOM(样式)，并添加 移除 到页面里 prototype.create prototype.remove
Square.prototype.create = function () {
  this.viewcontent.style.width = sw + "px";
  this.viewcontent.style.height = sh + "px";
  this.viewcontent.style.position = 'absolute';
  this.viewcontent.style.left = this.x + "px";
  this.viewcontent.style.top = this.y + "px";
  this.parent.appendChild(this.viewcontent)
}
Square.prototype.remove=function(){
  this.parent.removeChild(this.viewcontent);
}

//蛇 Snake
function Snake() {
//存一下蛇头的信息head
//存一下蛇尾的信息tail
//存储蛇身上的每一个方块的位置pos
//存储蛇走的方向，用一个对象来表示directionNum
  this.head = null
  this.tail = null
  this.pos = []
  this.directionNum = {
    left: {x:-1, y:0, rotate:180} , //蛇头在不同的方向中应该进行旋转，要不始终是向右
    right: {x:1, y:0, rotate:0},
    up: {x:0, y:-1, rotate:-90},
    down: {x:0, y:1, rotate:90}
  }
}

//初始化 1个蛇头 2个蛇身 prototype.init
Snake.prototype.init = function () {
  //创建蛇头 snakeHead
  var snakeHead = new Square(2,0, 'snakeHead')
  snakeHead.create()
  //存储蛇头信息
  //把蛇头的位置存起来
  this.head = snakeHead;
  this.pos.push([2,0])

  //创建蛇身体1 snakeBody1
  //把蛇身1的坐标也存起来
  var snakeBody1 = new Square(1,0, "snakeBody")
  snakeBody1.create()
  this.pos.push([1,0])

  //创建蛇身体2 即蛇尾  snakeBody2
  //把蛇尾的信息存起来
  //把蛇身2的坐标也存起来
  var snakeBody2 = new Square(0,0, "snakeBody")
  snakeBody2.create()
  this.tail = snakeBody2
  this.pos.push([0,0])

  //形成链表关系
  snakeHead.last = null;
  snakeHead.next = snakeBody1;
  snakeBody1.last = snakeHead;
  snakeBody1.next = snakeBody2;
  snakeBody2.last = snakeBody1;
  snakeBody2.next = null;
  //给蛇添加一条属性，用来表示蛇走的方向 direction
  //默认让蛇往右走
  this.direction = this.directionNum.right;
};


//这个方法用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情 prototype.getNextPos
Snake.prototype.getNextPos = function() {
  //蛇头要走的下一个点的坐标  nextPos
  var nextPos = [ this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y ]
  //下个点是自己，代表撞到了自己，游戏结束
  //是否撞到了自己 selfCollied
  // this.pos.forEach
  //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到自己了
  // console.log('撞到自己了！');
  var selfCollied = false
  this.pos.forEach(function (value) {
    if (value[0] === nextPos[0] && value[1] === nextPos[1]) {
      selfCollied = true
    }
  })
  if (selfCollied) {
    console.log('撞到自己了！');
    this.strategies.die.call(this);
    return
  }

  //下个点是围墙，游戏结束  console.log('撞墙了！');
  if (nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>tr-1 || nextPos[1]>td-1) {
    // console.log('撞墙了！');
    this.strategies.die.call(this);
    return;
  }
  //下个点是食物，吃
  //如果这个条件成立说明现在蛇头要走的下一个点是食物的那个点
  if (food && food.pos[0] === nextPos[0] && food.pos[1] === nextPos[1]) {
    this.strategies.eat.call(this)
  }
  //下个点什么都不是，走  以上三张情况都不符合 即 走
  this.strategies.move.call(this)
};

//处理碰撞后要做的事 prototype.strategies 属性 对象
// move eat die 三个函数
Snake.prototype.strategies = {
  move: function (format) {  //这个参数用于决定要不要删除最后一个方块（蛇尾）。当传了这个参数后就表示要做的事情是吃
    // console.log(this)
    //创建新身体（在旧蛇头的位置）
    var newBody = new Square(this.head.x/sw,this.head.y/sh,"snakeBody")
    //更新链表的关系
    newBody.next = this.head.next
    newBody.last = null
    this.head.next.last = newBody
    //把旧蛇头从原来的位置删除
    this.head.remove()
    newBody.create()
    //创建一个新蛇头(蛇头下一个要走到的点nextPos)
    var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y , "snakeHead")
    //更新链表的关系
    newHead.last = null
    newHead.next = newBody
    newBody.last = newHead
    newHead.viewcontent.style.transform='rotate('+this.direction.rotate+'deg)';
    newHead.create();
    //蛇身上的每一个方块的坐标也要更新(其实newBody的坐标是和储存的head一样的，不需要动。只需要在开头添加newHead坐标即可), 还要把this.head的信息更新一下
    this.pos.splice(0,0,[this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y ])
    this.head = newHead

    //如果fromat的值为false，表示需要删除,不吃（除了吃之外的操作）
    if(!format) {
      this.tail.remove()
      this.tail = this.tail.last
      this.pos.pop()
    }
  },
  eat: function () {
    // console.log("eat");
    // console.log(this)
    this.strategies.move.call(this,true)
    createFood();
    game.score++;
  },
  die: function () {
    // console.log("die");
    game.over();
  }
}

snake = new Snake();

//创建食物 createFood
function createFood() {
  //食物小方块的随机坐标
  var x = null;
  var y = null;
  // include  循环跳出的条件，true表示食物的坐标在蛇身上（需要继续循环）。false表示食物的坐标不在蛇身上（不循环了）
  var include = true
  while (include) {
    x = Math.round(Math.random()*(td -1));
    y = Math.round(Math.random()*(tr -1));
    snake.pos.forEach(function (value) {
      if ( x !== value[0] && y !== value[1]) {
        //这个条件成立说明现在随机出来的这个坐标，在蛇身上并没有找到。
        include = false
      }
    })
  }
  //生成食物
  food = new Square(x, y, "snakeFood ")
  //存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比
  food.pos = [x,y]
  var foodDom = document.querySelector('.snakeFood')
  if(foodDom) {
    foodDom.style.left = x*sw + 'px';
    foodDom.style.top = y*sh + 'px'
  }else {
    food.create()
  }
};

//创建游戏逻辑 Game
function Game() {
  // timer  score
  this.timer = null
  this.score = 0
}

// prototype.init
Game.prototype.init = function () {
  // 让蛇 和食物 创建好
  snake.init()
  createFood()
  //用户按下左键(37)的时候，这条蛇不能是正在往右走(蛇不能掉头) 上键(38) 右键(39) 下键(40)
  document.onkeydown = function (ev) {
    if(ev.which==37 && snake.direction!=snake.directionNum.right){	//用户按下左键的时候，这条蛇不能是正下往右走
      snake.direction=snake.directionNum.left;
    }else if(ev.which==38 && snake.direction!=snake.directionNum.down){
      snake.direction=snake.directionNum.up;
    }else if(ev.which==39 && snake.direction!=snake.directionNum.left){
      snake.direction=snake.directionNum.right;
    }else if(ev.which==40 && snake.direction!=snake.directionNum.up){
      snake.direction=snake.directionNum.down;
    }
  }
  this.start();
}
//开始游戏  prototype.start
Game.prototype.start = function () {
  //    开启定时器
  this.timer=setInterval(function(){
    snake.getNextPos();
  },200);
}

//暂停游戏  prototype.pause
Game.prototype.pause = function() {
  clearInterval(this.timer);
}
//结束游戏 prototype.over
Game.prototype.over = function() {
  clearInterval(this.timer);
  alert('你的得分为：'+this.score);
  //游戏回到最初始的状态
  var snakeWrap = document.getElementById('snakeWrap')
  snakeWrap.innerHTML = '';
  snake = new Snake()
  game = new Game()
  var startBtn=document.querySelector('.startBtn button');
  startBtn.parentNode.style.display='block';
}


game=new Game()
// 点击开始按钮 启动游戏
var startBtn=document.querySelector('.startBtn button');
startBtn.onclick=function(){
  startBtn.parentNode.style.display='none';
  game.init();
};
// 点击snakewrap大盒子，暂停游戏
var snakeWrap = document.getElementById('snakeWrap')
snakeWrap.onclick = function () {
  pauseBtn.parentNode.style.display='block';
  game.pause()
}
// 点击暂停按钮，继续游戏
var pauseBtn = document.querySelector('.pauseBtn button')
pauseBtn.onclick = function () {
  pauseBtn.parentNode.style.display='none';
  game.start()
}
