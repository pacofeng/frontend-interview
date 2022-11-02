<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [一、HTTP 缓存](#一-http-缓存)
- [二、WEBSQL](#二-websql)
- [三、IndexDB](#三-indexdb)
  _ [异步 API](#异步-api)
  _ [同步 API](#同步-api)
- [四、cookie](#四-cookie)
- [五、localstorage](#五-localstorage)
- [六、sessionstorage](#六-sessionstorage)
- [七、application cache](#七-application-cache)
- [八、cacheStorage](#八-cachestorage)
- [九、flash 缓存](#九-flash-缓存)

<!-- /code_chunk_output -->

浏览器缓存（Browser Caching）是浏览器端保存数据用于快速读取或避免重复资源请求的优化机制，有效的缓存使用可以避免重复的网络请求和浏览器快速地读取本地数据，整体上加速网页展示给用户。浏览器端缓存的机制种类较多，总体归纳为九种，这里详细分析下这九种缓存机制的原理和使用场景。

1. `http` 缓存: 基于 `HTTP` 协议的浏览器文件级缓存机制。
2. `websql` :这种方式只有较新的 `chrome` 浏览器支持，并以一个独立规范形式出现
3. `indexDB` :一个为了能够在客户端存储可观数量的结构化数据，并且在这些数据上使用索引进行高性能检索的 `API`
4. `Cookie` :一般网站为了辨别用户身份、进行 `session` 跟踪而储存在用户本地终端上的数据（通常经过加密）
5. `Localstorage`: html5 的一种新的本地缓存方案，目前用的比较多，一般用来存储 `ajax` 返回的数据，加快下次页面打开时的渲染速度
6. `Sessionstorage` : 和 `localstorage` 类似，但是浏览器关闭则会全部删除，`api` 和 `localstorage` 相同，实际项目中使用较少。
7. `application cache` : 是将大部分图片资源、js、css 等静态资源放在 manifest 文件配置中
8. `cacheStorage`: 在 `ServiceWorker` 的规范中定义的，可以保存每个 `serverWorker` 申明的 `cache` 对象

打开浏览器的调试模式->resources 左侧就有浏览器的 8 种缓存机制。

## 一、HTTP 缓存

http 缓存是基于 HTTP 协议的浏览器文件级缓存机制。即针对文件的重复请求情况下，浏览器可以根据协议头判断从服务器端请求文件还是从本地读取文件。以下是浏览器缓存的整个机制流程。主要是针对重复的 http 请求，在有缓存的情况下判断过程主要分 3 步：
详见[http 缓存详解](https://github.com/fyuanfen/note/blob/master/article/Network/%E5%BD%BB%E5%BA%95%E7%90%86%E8%A7%A3%E5%89%8D%E7%AB%AF%E7%BC%93%E5%AD%98%E4%B9%8B%E4%BA%8CHTTP%E7%BC%93%E5%AD%98.md)

下面我主要介绍 HTTP 协议定义的缓存机制。

## 二、WEBSQL

websql 这种方式只有较新的 chrome 浏览器支持，并以一个独立规范形式出现，主要有以下特点

- Web Sql 数据库 API 实际上不是 HTML5 规范的组成部分；
- 在 HTML5 之前就已经存在了，是单独的规范；
- 它是将数据以数据库的形式存储在客户端，根据需求去读取；
- 跟 Storage 的区别是： Storage 和 Cookie 都是以键值对的形式存在的；
- Web Sql 更方便于检索，允许 sql 语句查询；
- 让浏览器实现小型数据库存储功能；
- 这个数据库是集成在浏览器里面的，目前主流浏览器基本都已支持；

Websql API 主要包含三个核心方法：

- openDatabase : 这个方法使用现有数据库或创建新数据库创建数据库对象。
- transaction : 这个方法允许我们根据情况控制事务提交或回滚。
- executeSql : 这个方法用于执行真实的 SQL 查询。

## 三、IndexDB

IndexedDB 是一个为了能够在客户端存储可观数量的结构化数据，并且在这些数据上使用索引进行高性能检索的 API。虽然 DOM 存储 对于存储少量数据是非常有用的，但是它对大量结构化数据的存储就显得力不从心了。IndexedDB 则提供了这样的一个解决方案。

IndexedDB 分别为同步和异步访问提供了单独的 API 。同步 API 本来是要用于仅供 Web Workers 内部使用，但是还没有被任何浏览器所实现。异步 API 在 Web Workers 内部和外部都可以使用，另外浏览器可能对 indexDB 有 50M 大小的限制，一般用户保存大量用户数据并要求数据之间有搜索需要的场景。

### 异步 API

异步 API 方法调用完后会立即返回，而不会阻塞调用线程。要异步访问数据库，要调用 window 对象 indexedDB 属性的 `open()` 方法。该方法返回一个 IDBRequest 对象 (IDBOpenDBRequest)；异步操作通过在 IDBRequest 对象上触发事件来和调用程序进行通信。

### 同步 API

规范里面还定义了 API 的同步版本。同步 API 还没有在任何浏览器中得以实现。它原本是要和 webWork 一起使用的。

## 四、cookie

Cookie（或者 Cookies），指一般网站为了辨别用户身份、进行 `session` 跟踪而储存在用户本地终端上的数据（通常经过加密）。cookie 一般通过 `http` 请求中在头部一起发送到服务器端。一条 `cookie` 记录主要由键、值、域、过期时间、大小组成，一般用户保存用户的认证信息。`cookie` 最大长度和域名个数由不同浏览器决定，具体如下：

| 浏览器        | 支持域名个数 | 最大长度 |
| ------------- | ------------ | -------- |
| IE7 以上      | 50 个        | 4095B    |
| Firefox       | 50 个        | 4097B    |
| Opera         | 30 个        | 4096B    |
| Safari/WebKit | 无限制       | 4097B    |

不同域名之间的 `cookie` 信息是独立的，如果需要设置共享可以在服务器端设置 `cookie` 的 `path` 和 `domain` 来实现共享。浏览器端也可以通过`document.cookie`来获取`cookie`，并通过 js 浏览器端也可以方便地读取/设置 `cookie` 的值。

## 五、localstorage

`localStorage`是 `html5` 的一种新的本地缓存方案，目前用的比较多，一般用来存储 `ajax` 返回的数据，加快下次页面打开时的渲染速度。

| 浏览器         | 最大长度 |
| -------------- | -------- |
| IE9 以上       | 5M       |
| Firefox 8 以上 | 5.24M    |
| Opera          | 2M       |
| Safari/WebKit  | 2.6M     |

`localStorage` 核心 API:

- localStorage.setItem(key, value) //设置记录
- localStorage.getItem(key) //获取记录
- localStorage.removeItem(key) //删除该域名下单条记录
- localStorage.clear() //删除该域名下所有记录

值得注意的是，localstorage 大小有限制，不适合存放过多的数据，如果数据存放超过最大限制会报错，并移除最先保存的数据。

## 六、sessionstorage

`sessionStorage` 和 `localstorage` 类似，但是浏览器关闭则会全部删除，api 和 `localstorage` 相同，实际项目中使用较少。

## 七、application cache

application cahce 是将大部分图片资源、js、css 等静态资源放在 manifest 文件配置中。当页面打开时通过 manifest 文件来读取本地文件或是请求服务器文件。

离线访问对基于网络的应用而言越来越重要。虽然所有浏览器都有缓存机制，但它们并不可靠，也不一定总能起到预期的作用。HTML5 使用 ApplicationCache 接口可以解决由离线带来的部分难题。前提是你需要访问的 web 页面至少被在线访问过一次。

使用缓存接口可为您的应用带来以下三个优势：

1. 离线浏览 – 用户可在离线时浏览您的完整网站
2. 速度 – 缓存资源为本地资源，因此加载速度较快。
3. 服务器负载更少 – 浏览器只会从发生了更改的服务器下载资源。
   一个简单的离线页面主要包含以下几个部分：

index.html

```html
<html manifest="clock.manifest">
  <head>
    <title>AppCache Test</title>
    <link rel="stylesheet" href="clock.css" />
    <script src="clock.js"></script>
  </head>
  <body>
    <p><output id="clock"></output></p>
    <div id="log"></div>
  </body>
</html>
```

clock.manifest

```

CACHE MANIFEST
#VERSION 1.0
CACHE:
clock.css
clock.js
```

clock.js 和 clock.css 为独立的另外文件。

另外需要注意的是更新缓存。在程序中，你可以通过 window.applicationCache 对象来访问浏览器的 app cache。你可以查看 status 属性来获取 cache 的当前状态：

```javascript
var appCache = window.applicationCache;
switch (appCache.status) {
  case appCache.UNCACHED: // UNCACHED == 0
    return 'UNCACHED';
    break;
  case appCache.IDLE: // IDLE == 1
    return 'IDLE';
    break;
  case appCache.CHECKING: // CHECKING == 2
    return 'CHECKING';
    break;
  case appCache.DOWNLOADING: // DOWNLOADING == 3
    return 'DOWNLOADING';
    break;
  case appCache.UPDATEREADY: // UPDATEREADY == 4
    return 'UPDATEREADY';
    break;
  case appCache.OBSOLETE: // OBSOLETE == 5
    return 'OBSOLETE';
    break;
  default:
    return 'UKNOWN CACHE STATUS';
    break;
}
```

为了通过编程更新 cache，首先调用 applicationCache.update()。这将会试图更新用户的 cache（要求 manifest 文件已经改变）。最后，当 applicationCache.status 处于 UPDATEREADY 状态时， 调用 applicationCache.swapCache()，旧的 cache 就会被置换成新的。

```javascript

var appCache = window.applicationCache;
appCache.update(); // Attempt to update the user’s cache.
…
if (appCache.status == window.applicationCache.UPDATEREADY) {
  appCache.swapCache();  // The fetch was successful, swap in the new cache.
}
```

这里是通过更新 manifest 文件来控制其它文件更新的。

## 八、cacheStorage

`CacheStorage` 是在 `ServiceWorker` `的规范中定义的。CacheStorage` 可以保存每个 `serverWorker` 申明的 `cache` 对象，`cacheStorage` 有 `open`、`match`、`has`、`delete`、`keys` 五个核心方法，可以对 `cache` 对象的不同匹配进行不同的响应。

- cacheStorage.has()

      	如果包含cache对象，则返回一个promise对象。

- cacheStorage.open()

      	打开一个cache对象，则返回一个promise对象。

- cacheStorage.delete()

      	删除cache对象，成功则返回一个promise对象，否则返回false。

- cacheStorage.keys()

      	含有keys中字符串的任意一个，则返回一个promise对象。

- cacheStorage.delete()
  匹配 key 中含有该字符串的 cache 对象，返回一个 promise 对象。

## 九、flash 缓存

这种方式基本不用，这一方法主要基于 flash 有读写浏览器端本地目录的功能，同时也可以向 js 提供调用的 api，则页面可以通过 js 调用 flash 去读写特定的磁盘目录，达到本地数据缓存的目的。
