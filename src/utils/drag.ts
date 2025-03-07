/**
 * @description: 拖拽
 * @author: zhangzihao
 * @date: 2025/3/7
 */
/**
 *  添加元素请使用 drag.addItem(div)
 */
/**
 * 需要完善的功能
 * 
 * 生成一份JSON数据（操作，回显，保存）
*/
// <div class="drag">
//  <div class="drag-item" style="background-color:black;"></div>
//  <div class="drag-item" style="background-color:blue;"></div>
//  <div class="drag-item" style="background-color:red;"></div>
//  <div class="drag-item" style="background-color:yellow;"></div>
// </div>
// new Drag({
//   el:'.drag',      // 盒子
//   item:'.drag-item',    // 小盒子
//   marking:true,         // 是否显示标线
//   markingColor:'#f00',  // 标线颜色
//   dashed:true,          // 是否显示虚线
//   dashedColor:'#0f0',   // 虚线颜色
//   adsorbent:{
//     open:true,          // 是否开启吸附
//     distance:5          // 吸附距离
//   },
//   itemData:[{"id":"1","component":"123123","bg":"black","left":105,"top":309,"width":100,"height":100,"z_index":1006}]
// });
const boxStyle = `
      z-index: 9999999;
      position: absolute;
      background-color: rgba(13, 153, 255, 0.3);
      border: 1px solid rgb(13, 153, 255);
`;
class Drag {
  el: any; // 大盒子元素
  item: any; // 小盒子元素
  itemList: any; // 小盒子元素集合
  itemBoxSize: any; // 边框定点大小
  marking: any; // 标线
  dashed: any; // 虚线
  markingColor: string; // 标记颜色
  dashedColor: any; // 虚线颜色
  elInitPointer: any;
  currentEl: any; // 当前元素
  isActive: boolean; // 是否点击
  zIndex: number; // z-index
  resetZIndex: number;
  InitPointer: any; // 鼠标初始位置
  currentElItem: any; // 当前元素
  adsorbent: any; // 吸附效果
  ids: number; // 唯一标识符
  itemData: any;
  elPointer:any;

  select: any; //
  selectArr: any; //
  initPosition: any; // 鼠标初始位置
  moveBox: any; // 移动框
  boxItem: any;
  body: any;
  isMoveActive: any;
  constructor(e: any) {
    const {
      el,
      item,
      marking,
      markingColor,
      dashed,
      dashedColor,
      itemData = [],
      adsorbent = { open: false, distance: 5 },
    } = e;
    this.el = this.$(el);
    this.item = item;
    this.itemList = this.$All(item);
    this.itemBoxSize = 5;
    this.marking = marking;
    this.markingColor = markingColor;
    this.dashed = dashed;
    this.dashedColor = dashedColor;
    this.InitPointer = { x: 0, y: 0 };
    this.currentEl = null;
    this.currentElItem = null;
    this.isActive = false;
    this.ids = 1;
    this.zIndex = 5000;
    this.resetZIndex = 1001;
    this.adsorbent = adsorbent;
    this.itemData = itemData;
    this.elPointer = this.getClientRect(this.el);

    // 选择框
    this.select = [];
    this.boxItem = item;
    this.moveBox = null;
    this.initPosition = { x: 0, y: 0 };
    this.isMoveActive = false;
    this.init();
    this.MoveInit();
  }
  init() {
    this.initEl();
    this.echoDisplay().then(() => {
      this.itemList = this.$All(this.item);
      this.initItemEl();
      this.addEventEl();
      this.resetShowItem();
    });
  }
  // 回显
  echoDisplay() {
    return new Promise((resolve) => {
      this.itemData.forEach((item: any) => {
        const dom = document.createElement("div");
        dom.id = item.id;
        dom.classList.add("drag-item");
        dom.style.cssText = "position: absolute;";
        dom.style.width = item.width + "px";
        dom.style.height = item.height + "px";
        dom.style.left = item.left + "px";
        dom.style.top = item.top + "px";
        dom.style.zIndex = item.z_index;
        dom.style.backgroundColor = item.bg;
        this.el.appendChild(dom);
      });
      resolve(true);
    });
  }
  /**
   * 添加元素
   * @param e 拖拽元素
   * 1. 向子盒子添加元素
   * 2. 重新获取所有拖拽元素
   * 3. 初始化拖拽元素
   * 4. 添加事件
   */
  addItem(e:HTMLElement){
    const div = e;
    div.className = this.item.replace(/./,"");
    this.el.appendChild(div);
    this.itemList = this.$All(this.item);
    this.initItemEl(div)
    div.addEventListener("mousedown", this.ELMouseDown);
  }
  initEl() {
    this.el.style.cssText = "position: relative;";
  }
  addEventEl() {
    document.addEventListener("mousedown", this.windowMouseDown);
    for (let i = 0; i < this.itemList.length; i++) {
      this.itemList[i].addEventListener("mousedown", this.ELMouseDown);
    }
  }
  getAttr(el: any, attr: string) {
    return el.getAttribute(attr);
  }
  /**
   * 吸附效果
   */
  adsorbentFn() {
    const { open,distance } = this.adsorbent;
    if(!open)return;
    const elPointer = this.elPointer;
    const currentEl = this.currentEl;
    const currentElid = this.getAttr(currentEl,'id');
    // top left bottom right height width x y
    const currentElInfo = this.getClientRect(currentEl);
    const itemList = this.itemList;
    const setPosition = (position:string, itemPosition:number, elPointerPosition:number) => {
      currentEl.style[position] = `${itemPosition - elPointerPosition}px`;
    };
    for(let i = 0; i < itemList.length; i++){
      const item = itemList[i];
      const itemId = this.getAttr(item,'id');
      if(currentElid == itemId) continue;
      const itemInfo = this.getClientRect(item);
      // 获取移动距离用于判断（都是小盒子模型）
      const distanceX = Math.abs(itemInfo.left - currentElInfo.left); // left left
      const distanceY = Math.abs(itemInfo.top - currentElInfo.top); // top top
      const distanceXW = Math.abs(currentElInfo.left + currentElInfo.width - itemInfo.left); // right left
      const distanceYH = Math.abs(currentElInfo.top + currentElInfo.height - itemInfo.top); // bottom top
      const distanceLR = Math.abs(currentElInfo.left - (itemInfo.left + itemInfo.width)) // left right
      const distanceTB = Math.abs(currentElInfo.top - (itemInfo.top + itemInfo.height)) // top bottom
      const distanceBB = Math.abs(currentElInfo.top + currentElInfo.height - (itemInfo.top + itemInfo.height)) // bottom bottom
      // 设置吸附效果
      if(distanceX < distance){
        setPosition('left',itemInfo.left,elPointer.left)
      }
      if(distanceY < distance){
        setPosition('top',itemInfo.top,elPointer.top)
      }
      if(distanceXW < distance){
        setPosition('left',itemInfo.left - currentElInfo.width,elPointer.left)
      }
      if(distanceYH < distance){
        setPosition('top',itemInfo.top - currentElInfo.height,elPointer.top)
      }
      if(distanceLR < distance){
        setPosition('left',itemInfo.left + itemInfo.width,elPointer.left)
      }
      if(distanceTB < distance){
        setPosition('top',itemInfo.top + itemInfo.height,elPointer.top)
      }
      if(distanceBB < distance){
        setPosition('top',(itemInfo.top + itemInfo.height) - currentElInfo.height ,elPointer.top)
      }
    }
    this.isShowLine();
  }
  // 处理点击空白区域方法
  windowMouseDown = () => {
    this.resetShowItem();
    this.removeDashed();
  };
  ELMouseDown = (e: any) => {
    // 阻止向下冒泡
    e.stopPropagation();
    e.preventDefault();
    if (
      this.currentEl &&
      e.target.className !== "drag-item-box" &&
      this.currentEl != e.target
    ) {
      this.resetShowItem();
      this.removeDashed();
    }
    // console.log(e)
    // 判断是否为移动元素
    let target = e.target;
    const findParentEl = (e:any) => {
      if(e.parentElement.className != this.item.replace(/./,"")){
        findParentEl(e.parentElement)
      }else{
        target = e.parentElement;
      }
    }
    if(target.className != this.item.replace(/./,"") && e.target.className != "drag-item-box"){
      findParentEl(target);
    }
    this.currentEl = target;
    // 设置this.currentEL的z-index属性
    this.currentEl.style.zIndex = this.zIndex++;
    let rect = this.getClientRect(this.currentEl);
    // 设置初始坐标
    const elPointer = this.elPointer;
    this.elInitPointer = {
      x: e.x + elPointer.left,
      y: e.y + elPointer.top,
      rectX: rect.left,
      rectY: rect.top,
      rectW: rect.width,
      rectH: rect.height,
    };
    this.currentElItem = e.target;

    this.showCurrentItem();

    // 区分方块
    if (e.target.className == "drag-item-box") {
      this.isActive = true;
      this.currentEl = e.target.offsetParent;
      rect = this.getClientRect(this.currentEl);
      this.elInitPointer = {
        x: e.x + elPointer.left,
        y: e.y + elPointer.top,
        rectX: rect.left,
        rectY: rect.top,
        rectW: rect.width,
        rectH: rect.height,
        top: rect.top,
        left: rect.left,
      };
      document.addEventListener("mousemove", this.itemMouseMove);
      document.addEventListener("mouseup", this.itemMouseUp);
      return;
    }
    this.createDashed();
    document.addEventListener("mousemove", this.ELMouseMove);
    document.addEventListener("mouseup", this.ELMouseUp);
  };
  ELMouseMove = (e: any) => {
    this.removeShowLine();
    const { x: initX, y: initY, rectX, rectY } = this.elInitPointer;
    const { x, y } = e;
    const xMove = rectX + x - initX;
    const yMove = rectY + y - initY;
    this.currentEl.style.top = `${yMove}px`;
    this.currentEl.style.left = `${xMove}px`;
    this.isOutBoundary();
    this.adsorbentFn();
  };
  ELMouseUp = () => {
    document.removeEventListener("mousemove", this.ELMouseMove);
    document.removeEventListener("mouseup", this.ELMouseUp);
    this.removeShowLine();
  };
  itemMouseMove = (e: any) => {
    this.removeShowLine();
    this.moveItemBox(e);
    this.isShowLine();
  };
  itemMouseUp = () => {
    this.removeShowLine();
    document.removeEventListener("mousemove", this.itemMouseMove);
    document.removeEventListener("mouseup", this.itemMouseUp);
  };
  // 当前元素顶点显示
  showCurrentItem(id: string = "") {
    if (id) {
      const dom = this.selectArr.find((item: any) => item.id === id);
      dom.dom.querySelectorAll(".drag-item-box").forEach((item: any) => {
        item.style.display = "block";
      });
      return;
    }
    const list = this.currentEl.querySelectorAll(".drag-item-box");
    if (list.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      list[i].style.display = "block";
    }
  }
  // 重置所有顶点显示
  resetShowItem(id: string = "") {
    if (id) {
      const dom = this.selectArr.find((item: any) => item.id === id);
      dom.dom.querySelectorAll(".drag-item-box").forEach((item: any) => {
        item.style.display = "none";
      });
      return;
    }
    const list = this.$All(".drag-item-box");
    if (list.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      list[i].style.display = "none";
    }
  }
  // 创建边框虚线
  createDashed() {
    if (this.dashed && this.currentEl)
      this.currentEl.style.outline = "1px dashed " + this.dashedColor;
  }
  // 移除边框虚线
  removeDashed() {
    if (this.currentEl) this.currentEl.style.outline = "";
  }
  // 判断是否出现标线
  isShowLine(all = false) {
    const arr = ["bottom", "left", "top", "right"];
    const rect = this.getClientRect(this.currentEl);
    for (let i = 0; i < this.itemList.length; i++) {
      const item = this.itemList[i];
      const itemInfo = this.getClientRect(item);
      if (this.currentEl === item) continue;
      for (let j = 0; j < arr.length; j++) {
        for (let k = 0; k < arr.length; k++) {
          if(all){
            this.createShowLine(arr[j], itemInfo[arr[j]]);
            break;
          }
          if (this.RestrictionDirection(arr[k], arr[j]) && rect[arr[k]] == itemInfo[arr[j]]) {
            this.createShowLine(arr[j], itemInfo[arr[j]]);
          }
        }
      }
    }
  }
  // 限制方向

  RestrictionDirection(type1:string,type2:string){
    const arr = [['bottom','top'],['left','right']]; 
    for(let i = 0; i < arr.length; i++){
      if(arr[i].includes(type1) && arr[i].includes(type2)){
        return true;
      }else if(arr[i].includes(type2) && arr[i].includes(type1)){
        return true;
      }
    }    
  }
  /**
   * 创建标线
   * @param type 方向
   * @param num 位置
   * @returns
   */
  createShowLine(type: any, num: any) {
    if (!this.marking) return;
    const elPointer = this.elPointer;
    // type 方向 num 位置
    const arr1 = ["top", "bottom"];
    const arr2 = ["left", "right"];
    const line = document.createElement("div");
    line.id = "drag-line";
    line.style.cssText = `
          z-index: 999999;
          position: absolute;
          width: ${arr1.includes(type) ? "100%" : "0px"};
          height: ${arr2.includes(type) ? "100%" : "0px"};
          ${arr1.includes(type) ? `border-top:1px dashed ${this.markingColor};` : `border-left:1px dashed ${this.markingColor};`}
          ${arr1.includes(type) ? "top" : "left"}: ${num - (arr1.includes(type) ? elPointer.top : elPointer.left)}px;
      }`;
    this.el.appendChild(line);
  }
  // 移除标线
  removeShowLine() {
    const list = this.$All("#drag-line");
    if (list.length === 0) return;
    list.forEach((item) => {
      item.remove();
    });
  }

  // 初始化子元素
  initItemEl(el:any = '') {
    const boxItme = 8;
    if(el){
      el.style.position = "absolute";
      el.setAttribute("id",'zz' + this.ids++); // 为每个子元素添加唯一标识
      for (let j = 0; j < boxItme; j++) {
        this.addItemBoxDom(el, j);
      }
    }else{
      for (let i = 0; i < this.itemList.length; i++) {
        const item = this.itemList[i];
        item.style.position = "absolute";
        item.setAttribute("id",'zz' +  this.ids++); // 为每个子元素添加唯一标识
        for (let j = 0; j < boxItme; j++) {
          this.addItemBoxDom(item, j);
        }
      }
    }
  }
  // 移动定点
  moveItemBox(e: any) {
    this.isOutBoundary();
    
    const dataIndex = Number(this.currentElItem.getAttribute("data-index"));
    const elPointer = this.elPointer;
    // 如果当前是激活状态，先初始化位置
    if (this.isActive) {
      this.initializePointer(dataIndex);
      this.isActive = false;
    }

    const { x, y } = this.elInitPointer;
    const xx = x - elPointer.left;
    const yy = y - elPointer.top;

    const moveX = e.clientX - elPointer.left;
    const moveY = e.clientY - elPointer.top;

    // 计算宽度和高度
    const width = Math.abs(xx - moveX);
    const height = Math.abs(yy - moveY);

    // 根据 dataIndex 调整大小和位置
    this.adjustElementPositionAndSize(
      dataIndex,
      xx,
      yy,
      moveX,
      moveY,
      width,
      height
    );
  }

  // 初始化指针位置
  initializePointer(dataIndex: number) {
    const { rectW, rectH, left, top } = this.elInitPointer;
    const positionHandlers: Record<number, () => void> = {
      0: () => this.updatePointer(left + rectW, top + rectH, left, top),
      2: () => this.updatePointer(left, top + rectH, left + rectW, top),
      5: () => this.updatePointer(left + rectW, top, left, top + rectH),
      7: () => this.updatePointer(left, top, left + rectW, top + rectH),
      1: () => this.updatePointer(undefined, top + rectH, undefined, top),
      6: () => this.updatePointer(undefined, top, undefined, top + rectH),
      3: () => this.updatePointer(left + rectW, undefined, left, undefined),
      4: () => this.updatePointer(left, undefined, left + rectW, undefined),
    };
    positionHandlers[dataIndex]?.(); // 根据索引处理初始化
  }

  // 更新指针位置
  updatePointer(
    x: number | undefined,
    y: number | undefined,
    moveX: number | undefined,
    moveY: number | undefined
  ) {
    if (x !== undefined) this.elInitPointer.x = x;
    if (y !== undefined) this.elInitPointer.y = y;
    if (moveX !== undefined) this.elInitPointer.moveX = moveX;
    if (moveY !== undefined) this.elInitPointer.moveY = moveY;
  }

  // 根据 dataIndex 调整元素大小和位置
  adjustElementPositionAndSize(
    dataIndex: number,
    x: number,
    y: number,
    moveX: number,
    moveY: number,
    width: number,
    height: number
  ) {
    const cornerIndices = [0, 2, 5, 7];
    const verticalIndices = [1, 6];
    const horizontalIndices = [3, 4];

    if (cornerIndices.includes(dataIndex)) {
      this.adjustForCorners(x, y, moveX, moveY, width, height);
    } else if (verticalIndices.includes(dataIndex)) {
      this.adjustForVertical(y, moveY, height);
    } else if (horizontalIndices.includes(dataIndex)) {
      this.adjustForHorizontal(x, moveX, width);
    }
  }

  // 调整角点位置和大小
  adjustForCorners(
    x: number,
    y: number,
    moveX: number,
    moveY: number,
    width: number,
    height: number
  ) {
    if (moveX > x && moveY > y) {
      this.setElementPosition(x, y);
    } else if (y > moveY && x < moveX) {
      this.setElementPosition(x, moveY);
    } else if (moveX < x && moveY > y) {
      this.setElementPosition(moveX, y);
    } else if (moveY < y && moveX < x) {
      this.setElementPosition(moveX, moveY);
    }
    this.setElementSize(width, height);
  }

  // 调整垂直方向位置和高度
  adjustForVertical(y: number, moveY: number, height: number) {
    this.currentEl.style.top = moveY > y ? `${y}px` : `${moveY}px`;
    this.currentEl.style.height = `${height}px`;
  }

  // 调整水平方向位置和宽度
  adjustForHorizontal(x: number, moveX: number, width: number) {
    this.currentEl.style.left = moveX > x ? `${x}px` : `${moveX}px`;
    this.currentEl.style.width = `${width}px`;
  }

  // 设置元素位置
  setElementPosition(left: number, top: number) {
    this.currentEl.style.left = `${left}px`;
    this.currentEl.style.top = `${top}px`;
  }

  // 设置元素大小
  setElementSize(width: number, height: number) {
    this.currentEl.style.width = `${width}px`;
    this.currentEl.style.height = `${height}px`;
  }
  // 子元素添加边框定点
  addItemBoxDom(dom: any, index: any) {
    const cursors = [
      "nw-resize",
      "n-resize",
      "sw-resize",
      "e-resize",
      "w-resize",
      "ne-resize",
      "n-resize",
      "nw-resize",
    ];
    const div: any = document.createElement("div");
    div.classList = "drag-item-box";
    div.setAttribute("data-index", index);
    div.style.cssText = `z-index:1000;cursor:${cursors[index]};position: absolute;width:${this.itemBoxSize}px;height:${this.itemBoxSize}px;border:1px solid #000;`;
    let x = "",y = "";
    // itemBoxSize 一半
    const itemBoxh = this.itemBoxSize / 2;
    const style: any = {
      0: () => {
        x = `calc(-${itemBoxh}px)`;
        y = `calc(-${itemBoxh}px)`;
      },
      1: () => {
        x = `calc(50% - ${itemBoxh}px)`;
        y = `calc(-${itemBoxh}px)`;
      },
      2: () => {
        x = `calc(100% - ${itemBoxh}px)`;
        y = `calc(-${itemBoxh}px)`;
      },
      3: () => {
        x = `calc(-${itemBoxh}px)`;
        y = `calc(50% - ${itemBoxh}px)`;
      },
      4: () => {
        x = `calc(100% - ${itemBoxh}px)`;
        y = `calc(50% - ${itemBoxh}px)`;
      },
      5: () => {
        x = `calc(-${itemBoxh}px)`;
        y = `calc(100% - ${itemBoxh}px)`;
      },
      6: () => {
        x = `calc(50% - ${itemBoxh}px)`;
        y = `calc(100% - ${itemBoxh}px)`;
      },
      7: () => {
        x = `calc(100% - ${itemBoxh}px)`;
        y = `calc(100% - ${itemBoxh}px)`;
      },
    };
    style[index]();
    div.style.left = x;
    div.style.top = y;
    dom.appendChild(div);
  }
  // 判断方块是否到边界
  isOutBoundary() {
    const container = this.getClientRect(this.el);
    const rect = this.getClientRect(this.currentEl);
    if (rect.left - container.left <= 0) {
      this.currentEl.style.left = 0 + 'px';
    }
    if (rect.top - container.top <= 0) {
      this.currentEl.style.top = 0 + 'px';
    }
    if ((rect.left - container.left) + rect.width > container.width) {
      this.currentEl.style.left = container.width - rect.width + "px";
    }
    if (rect.top - container.top + rect.height >= container.height) {
      this.currentEl.style.top = container.height - rect.height + "px";
    }
  }
  /**
   * 获取元素属性
   * @param dom
   * @returns top left bottom right height width x y
   */
  getClientRect(dom: any) {
    const style = getComputedStyle(dom);
    return Object.assign(dom.getBoundingClientRect(), {
      zIndex: parseInt(style.zIndex),
    });
  }
  $(el: any) {
    return document.querySelector(el);
  }
  $All(el: any) {
    const el_list = document.querySelectorAll(el);
    if (el_list.length <= 0) {
      return [];
    }
    return el_list;
  }
  // 获取子元素数据
  getJSONData(file = false) {
    const data: any = [];
    for (let i = 0; i < this.itemList.length; i++) {
      const item = this.itemList[i];
      const itemInfo = this.getClientRect(item);
      data.push({
        id: item.getAttribute("id"),
        component: "123123",
        bg: item.style.backgroundColor,
        left: itemInfo.left,
        top: itemInfo.top,
        width: itemInfo.width,
        height: itemInfo.height,
        z_index: itemInfo.zIndex,
      });
    }
    data.sort((a: any, b: any) => {
      return a.z_index - b.z_index;
    });
    // 重置z-index
    for (let i = 0; i < data.length; i++) {
      data[i].z_index = 1001 + i;
    }
    if (file) {
      const str = JSON.stringify(data);
      var blob = new Blob([str], { type: "text/plain" });
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = "data.txt";
      a.click();
    }
    return data;
  }
  // ```````` 移动框
  MoveInit() {
    this.body = this.el;
    this.body.style.cursor = "crosshair";
    this.createMoveBox();
  }
  createMoveBox() {
    const box = document.createElement("div");
    box.style.cssText = boxStyle;
    this.moveBox = box;
    this.initEvent();
  }
  // 获取所有子元素
  getSelectBox = () => {
    this.select = [];
    const domArr = document.querySelectorAll(this.boxItem);
    for (let i = 0; i < domArr.length; i++) {
      const item = domArr[i];
      const obj = {
        dom: item,
        x: item.getBoundingClientRect().left,
        y: item.getBoundingClientRect().top,
        width: item.getBoundingClientRect().width,
        height: item.getBoundingClientRect().height,
      };
      this.select.push(obj);
    }
  };
  initEvent() {
    this.body.addEventListener("mousedown", this.MoveMouseDown);
  }
  MoveMouseDown = (e: any) => {
    this.resetShowItem();
    this.isMoveActive = true;
    this.getSelectBox();
    this.moveBox.style.width = "0px";
    this.moveBox.style.height = "0px";
    this.selectArr = [];
    this.el.append(this.moveBox);
    this.initPosition.x = e.clientX;
    this.initPosition.y = e.clientY;
    this.moveBox.style.top = e.clientY + "px";
    this.moveBox.style.left = e.clientX + "px";
    window.addEventListener("mousemove", this.MoveMouseMove);
    window.addEventListener("mouseup", this.MoveMouseUp);
  };
  MoveMouseMove = (e: any) => {

    const { x, y } = this.initPosition;
    // 设置移动位置
    const moveX = e.clientX;
    const moveY = e.clientY;
    // 计算移动后对应元素宽高
    const width = Math.abs(x - moveX);
    const height = Math.abs(y - moveY);

    let left = x;
    let top = y;
    if (moveX < x) left = moveX;
    if (moveY < y) top = moveY;

    // 计算边界
    const { clientWidth: windowWidth, clientHeight: windowHeight } = this.el;

    let endWidth = width;
    let endHeight = height;

    const leftPos = parseInt(this.moveBox.style.left || "0", 10);
    const topPos = parseInt(this.moveBox.style.top || "0", 10);
    // 判断是否到达边界
    if (endWidth + leftPos >= windowWidth) {
      endWidth = windowWidth - leftPos - 2;
    }
    if (endHeight + topPos >= windowHeight) {
      endHeight = windowHeight - topPos - 2;
    }
    const elPointer = this.elPointer;
    requestAnimationFrame(() => {
      this.moveBox.style.left = left - elPointer.left + "px";
      this.moveBox.style.top = top - elPointer.top + "px";
      this.moveBox.style.width = endWidth + "px";
      this.moveBox.style.height = endHeight + "px";
      this.isSelect();
    });
  };
  MoveMouseUp = () => {
    this.isMoveActive = false;
    if (this.moveBox && this.el.contains(this.moveBox)) {
      this.el.removeChild(this.moveBox);
    }
    this.el.removeEventListener("mousemove", this.MoveMouseMove);
    this.el.removeEventListener("mouseup", this.MoveMouseUp);
  };
  isSelect() {
    if (!this.isMoveActive) return;
    const { width, height, left, top } = this.moveBox.getBoundingClientRect();
    for (let i = 0; i < this.select.length; i++) {
      const item = this.select[i];
      const id = item.dom.getAttribute("id");
      if (
        left < item.x + item.width &&
        item.x < left + width &&
        top < item.y + item.height &&
        item.y < top + height
      ) {
        if (!this.selectArr.find((items: any) => items === item)) {
          // 判断是否存在
          if (this.selectArr.some((someItem: any) => someItem.id === id))
            continue;
          const obj = {
            id,
            dom: item.dom,
          };
          this.selectArr.push(obj);
          this.showCurrentItem(id);
        }
      } else {
        if (this.selectArr.find((items: any) => items.id === id)) {
          this.resetShowItem(id);
          this.selectArr.splice(
            this.selectArr.findIndex((items: any) => items === item),
            1
          );
        }
      }
    }
  }
}

export default Drag;
