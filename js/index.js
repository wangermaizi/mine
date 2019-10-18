/**
 * Created by LSY on 2019/10/13.
 */

//面向对象的写法-->扩展性较强
function Mine(tr,td,mineNum){
    this.tr = tr;//用户传入行数，列数，雷数
    this.td = td;
    this.mineNum = mineNum;//雷的数量

    this.squares = [];//存储所有方块的信息，数组，按行列顺序的排放，存取都是行列的形式
    this.tds = [];//存储所有单元格的BOM
    this.surplusMine = mineNum;//剩余雷的数量
    this.allRight = false;//右击标记是否全是雷，用来判断用户是否游戏成功

    this.parent = document.querySelector('.gameBox');
}
//生成n个不从复的数字-->生成雷数
Mine.prototype.randomNum = function(){
    //
    var square = new Array(this.tr*this.td);
    for(var i = 0;i<square.length;i++){
        square[i] = i;
    }
    square.sort(function(){
        return 0.5-Math.random()
    });
    /*console.log(square);*/
    return square.slice(0,this.mineNum)
};
//生成n个不重复的数字结束

//添加方法
Mine.prototype.init = function(){
    /*this.randomNum();//此处会生成0-tr*td的99个随机数字*/
    var rw = this.randomNum();//雷在格子中的位置
    var n = 0;//用来找到格子对应的索引值
    for(var i = 0;i<this.tr;i++){
        this.squares[i] = [];
        for(var j = 0;j<this.td;j++){
            //注意！！！行列与xy的值是相反的；
            //this.squares[i][j] = ;
            /*取一个方块在数组里的数据要使用行与列*/
            //n++;
            if(rw.indexOf(++n) != -1){
                //现在循环到的索引在雷的数组找到了，则表示是雷
                this.squares[i][j] = {type:'mine',x:j,y:i}
            }else{
                //不是雷，则显示一个数字
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};//数字的value值在这里是不对的
            }
        }
    }

/*    console.log(this.squares);*/
    this.updateNum();
    this.createDom();
    this.parent.oncontextmenu = function(){
        return false;
    };

    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
};

//创建表格
Mine.prototype.createDom = function(){
    var table = document.createElement('table');
    //先创建行
    var that = this;
    for(var i = 0;i<this.tr;i++){
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        //再创建列
        for(var j =0;j<this.td;j++){
            var domTd = document.createElement('td');

            //创建点击事件
            domTd.pos = [i,j];//把格子对应的行与列存到格子身上
            domTd.onmousedown = function(){
                that.play(event,this);

            };

            this.tds[i][j] = domTd;//把所有创建的td添加到数组中

            //尝试创建雷
            /*if(this.squares[i][j].type=='mine'){
                domTd.className = 'mine';
            }else if(this.squares[i][j].type=='number'){
                domTd.innerHTML = this.squares[i][j].value;
            }*/
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';//多次点击创建多个表格
    this.parent.appendChild(table);
};
//表格创建完成

//创建方法
//找某个方法周围的8个格子

Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];//把找到的格子的坐标返回出去；这是个二维数组
    /*  关于坐标的理解
        x-1,y-1  x,y-1   x+1,y-1
    *    x-1,y    x,y     x+1,y
    *   x-1,y    x,y+1   x+1,y+1
    * */
    //通过坐标循环到九宫格
    //先循环行
    for(var i = x-1;i<=x+1;i++){
        //再循环列
        for(var j = y-1;j<=y+1;j++){
            if(
                i<0 || //格子超出了左边的范围
                j<0 || //格子超出了上边的范围
                i>this.td-1 || //格子超出了右边的范围
                j>this.tr-1 || //格子超出了下边的范围
                (i==x && j==y) || //当前循环到的格子是自己
                this.squares[j][i].type=='mine' //周围的格子是个雷
            ){
                continue;
            }
            result.push([j,i]);//这里要以行列的形式返回出去
        }
    }
    return result;
};
//更新所有的数字
Mine.prototype.updateNum = function() {
    for (var i = 0; i < this.tr; i++) {

        for (var j = 0; j < this.td;j++) {
            //只更新的是雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);//每一个雷周围的数字
            //console.log(num);
            for(var k = 0;k<num.length;k++){
                /*num[i] == [0,1];
                num[i][0] == 0;
                num[i][1] == 1;*/
                this.squares[num[k][0]][num[k][1]].value += 1;

            }
        }
    }
    //console.log(this.squares);
};
//调试-->检查是否能成功创建表格

Mine.prototype.play = function(ev,obj){
    var that = this;
    if(ev.which==1 && obj.className != 'flag'){
        //判断点击鼠标左右键
        //console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        //console.log(curSquare);
        var colorList = ['zero','one','two','three','four','five','six','seven','eight'];
        if(curSquare.type=='number'){
            //点到数字
            //console.log('数字');
            obj.innerHTML = curSquare.value;
            obj.className = colorList[curSquare.value];

            //点击到0时
            if(curSquare.value == 0){
                //开始进行递归函数
                /*1、显示自己
                  2、找四周
                *    1、显示自己
                *    2、找四周（如果四周不为0，则显示到这里就可以了）
                *       1、显示自己
                *       2、找四周（如果四周不为0，则显示到这里就可以了）*/
                obj.innerHTML = '';//如果为零的话就不显示
                function getAllZero(square){
                    var around = that.getAround(square);//找到了周围的n个格子
                    for(var i = 0;i<around.length;i++){
                        //around[i] = [0,0]
                        var x = around[i][0];//行
                        var y = around[i][1];//列

                        that.tds[x][y].className = colorList[that.squares[x][y].value];
                        if(that.squares[x][y].value == 0){
                            //如果以某个格子为中心找到的格子为零，那就接着调用函数
                            if(!(that.tds[x][y].check)){
                                //给对应的td添加一条属性
                                that.tds[x][y].check = true;
                                getAllZero(that.squares[x][y]);
                            }
                        }else{
                            //找到数字后终止递归函数
                            //找到的格子不为零
                            that.tds[x][y].innerHTML = that.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        }else{
            //点到雷

            this.gameOver(obj);
            //console.log('雷');
        }
    }
    //鼠标右键事件
    if(ev.which == 3){
        //如果右击的是一个数字或者0，则不能点击
        if(obj.className &&obj.className != 'flag'){
            return;
        }
        obj.className = obj.className == 'flag'?'':'flag';
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight  = true;
        }else{
            this.allRight = false;
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;//竖起小红旗，则雷数相对应地减一

        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;

        }
        //剩余雷数为0时，判断游戏是否胜利
        if(this.surplusMine == 0){
            //胜利条件，红旗标完后判断
            if(this.allRight){
                //这个
                alert('游戏成功');
            }else{
                alert("游戏失败");
                this.gameOver();
            }
        }

    }
};

//游戏失败后的函数
/*1、显示所有的雷
 * 2、取消所有格子的点击事件
 * 3、给点中的那个雷标红*/
Mine.prototype.gameOver = function(clickTd){
    for(var i = 0;i<this.tr;i++){
        for(var j = 0;j<this.td;j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    alert('游戏失败');
    if(clickTd){
        clickTd.style.backgroundColor = '#f00';
    }
};

//添加上边按钮的功能
var btns = document.querySelectorAll('.level button');
var mine = null;//用来存储生成的实例
var ln = 0;//用来选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i = 0; i<btns.length-1;i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';
        //赋值
        mine = new Mine(arr[i][0],arr[i][1],arr[i][2]);
        //调用
        mine.init();
        ln = i;
    }
}
//预加载部分
btns[0].onclick();

//重新游戏部分
btns[3].onclick = function(){
    mine.init();
};


/*var try_Mine = new Mine(28,28,99);
try_Mine.init();*/
//console.log(try_Mine.getAround(try_Mine.squares[0][0]));

