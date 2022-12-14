<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [跨页面通信的各种姿势](#跨页面通信的各种姿势)
  - [一、获取句柄](#一-获取句柄)
    - [tips](#tips)
    - [优劣](#优劣)
  - [二、localStorage](#二-localstorage)
    - [具体方案](#具体方案)
    - [tips](#tips-1)
    - [优劣](#优劣-1)
  - [三、BroadcastChannel](#三-broadcastchannel)
    - [具体方案](#具体方案-1)
    - [优劣](#优劣-2)
  - [四、SharedWorker](#四-sharedworker)
    - [具体方案](#具体方案-2)
    - [优劣](#优劣-3)
  - [五、Cookie](#五-cookie)
    - [具体方案](#具体方案-3)
    - [优劣](#优劣-4)
  - [六、Server](#六-server)
    - [乞丐版](#乞丐版)
    - [Server-sent Events / Websocket](#server-sent-events-websocket)
      - [SSE](#sse)
      - [Websocket](#websocket)
    - [消息队列](#消息队列)

<!-- /code_chunk_output -->

# 跨页面通信的各种姿势

将跨页面通讯类比计算机进程间的通讯，其实方法无外乎那么几种，而 web 领域可以实现的技术方案主要是类似于以下两种原理：

- 获取句柄，定向通讯
- 共享内存，结合轮询或者事件通知来完成业务逻辑

由于第二种原理更利于解耦业务逻辑，具体的实现方案比较多样。以下是具体的实现方案，简单介绍下，权当科普：

## 一、获取句柄

具体方案
父页面通过`window.open(url, name)`方式打开的子页面可以获取句柄，然后通过 `postMessage` 完成通讯需求。

```javascript
// parent.html
const childPage = window.open('child.html', 'child');

childPage.onload = () => {
  childPage.postMessage('hello', location.origin);
};

// child.html
window.onmessage = (evt) => {
  // evt.data
};
```

### tips

1. 当指定`window.open`的第二个 name 参数时，再次调用`window.open('****', 'child')`会使之前已经打开的同 name 子页面刷新
2. 由于安全策略，异步请求之后再调用`window.open`会被浏览器阻止，不过可以通过句柄设置子页面的 url 即可实现类似效果

```
// 首先先开一个空白页
const tab = window.open('about:blank')

// 请求完成之后设置空白页的url
fetch(/* ajax */).then(() => {
	tab.location.href = '****'
})
```

### 优劣

缺点是只能与自己打开的页面完成通讯，应用面相对较窄；但优点是在跨域场景中依然可以使用该方案。

## 二、localStorage

### 具体方案

设置共享区域的 `storage`，`storage` 会触发 `storage` 事件

```javascript
// A.html
localStorage.setItem('message', 'hello');

// B.html
window.onstorage = (evt) => {
  // evt.key, evt.oldValue, evt.newValue
};
```

### tips

1. 触发写入操作的页面下的 storage listener 不会被触发
2. storage 事件只有在发生改变的时候才会触发，即重复设置相同值不会触发 listener
3. safari 隐身模式下无法设置 localStorage 值

### 优劣

API 简单直观，兼容性好，除了跨域场景下需要配合其他方案，无其他缺点

## 三、BroadcastChannel

### 具体方案

和`localStorage`方案基本一致，额外需要初始化

```javascript
// A.html
const channel = new BroadcastChannel('tabs');
channel.onmessage = (evt) => {
  // evt.data
};

// B.html
const channel = new BroadcastChannel('tabs');
channel.postMessage('hello');
```

### 优劣

和`localStorage`方案没特别区别，都是同域、API 简单，`BroadcastChannel`方案兼容性差些（chrome > 58），但比`localStorage`方案生命周期短（不会持久化），相对干净些。

## 四、SharedWorker

### 具体方案

SharedWorker 本身并不是为了解决通讯需求的，它的设计初衷应该是类似总控，将一些通用逻辑放在 SharedWorker 中处理。不过因为也能实现通讯，所以一并写下：

```javascript
// A.html
var sharedworker = new SharedWorker('worker.js');
sharedworker.port.start();
sharedworker.port.onmessage = (evt) => {
  // evt.data
};

// B.html
var sharedworker = new SharedWorker('worker.js');
sharedworker.port.start();
sharedworker.port.postMessage('hello');

// worker.js
const ports = [];
onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);
  port.onmessage = (evt) => {
    ports
      .filter((v) => v !== port) // 此处为了贴近其他方案的实现，剔除自己
      .forEach((p) => p.postMessage(evt.data));
  };
};
```

### 优劣

相较于其他方案没有优势，此外，API 复杂而且调试不方便。

## 五、Cookie

### 具体方案

一个古老的方案，有点 localStorage 的降级兼容版，我也是整理本文的时候才发现的，思路就是往 document.cookie 写入值，由于 cookie 的改变没有事件通知，所以只能采取轮询脏检查来实现业务逻辑。

方案比较丑陋，势必被淘汰的方案，贴一下原版思路地址，我就不写 demo 了。

[communication between browser windows (and tabs too) using cookies](https://stackoverflow.com/questions/4079280/javascript-communication-between-browser-tabs-windows/4079423)

### 优劣

相较于其他方案没有存在优势的地方，只能同域使用，而且污染 cookie 以后还额外增加 AJAX 的请求头内容。

## 六、Server

之前的方案都是前端自行实现，势必受到浏览器限制，比如无法做到跨浏览器的消息通讯，比如大部分方案都无法实现跨域通讯（需要增加额外的 postMessage 逻辑才能实现）。通过借助服务端，还有很多增强方案，也一并说下。

### 乞丐版

后端无开发量，前端定期保存，在 tab 被激活时重新获取保存的数据，可以通过校验 hash 之类的标记位来提升检查性能。

```javascript
window.onvisibilitychange = () => {
  if (document.visibilityState === 'visible') {
    // AJAX
  }
};
```

### Server-sent Events / Websocket

项目规模小型的时候可以采取这类方案，后端自行维护连接，以及后续的推送行为。

#### SSE

```javascript
// 前端
const es = new EventSource('/notification');

es.onmessage = (evt) => {
  // evt.data
};
es.addEventListener(
  'close',
  () => {
    es.close();
  },
  false
);

// 后端，express为例
const clients = [];

app.get('/notification', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  clients.push(res);
  req.on('aborted', () => {
    // 清理clients
  });
});
app.get('/update', (req, res) => {
  // 广播客户端新的数据
  clients.forEach((client) => {
    client.write('data:hello\n\n');
    setTimeout(() => {
      client.write('event:close\ndata:close\n\n');
    }, 500);
  });
  res.status(200).end();
});
```

#### Websocket

socket.io、sockjs 例子比较多，略

### 消息队列

项目规模大型时，需要消息队列集群长时间维护长链接，在需要的时候进行广播。

提供该类服务的云服务商很多，或者寻找一些开源方案自建。

例如 MQTT 协议方案（阿里云就有提供），web 客户端本质上也是 websocket，需要集群同时支持 ws 和 mqtt 协议，示例如下：

```javascript
// 前端
// 客户端使用开源的Paho
// port会和mqtt协议通道不同
const client = new Paho.MQTT.Client(host, port, 'clientId');

client.onMessageArrived = (message) => {
  // message. payloadString
};
client.connect({
  onSuccess: () => {
    client.subscribe('notification');
  },
});
// 抑或，借助flash（虽然快要被淘汰了）进行mqtt协议连接并订阅相应的频道，flash再通过回调抛出消息

// 后端
// 根据服务商提供的Api接口调用频道广播接口
```

[来源](https://juejin.im/post/59bb7080518825396f4f5177)
