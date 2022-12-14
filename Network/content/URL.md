<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [解析 URL](#解析-url)
- [输入的是 URL 还是搜索的关键字？](#输入的是-url-还是搜索的关键字)
- [转换非 ASCII 的 Unicode 字符](#转换非-ascii-的-unicode-字符)
- [检查 HSTS 列表](#检查-hsts-列表)
- [DNS 查询](#dns-查询)
- [ARP 过程](#arp-过程)
- [TCP 三次握手](#tcp-三次握手)
- [TLS 握手](#tls-握手)
- [HTTP 协议](#http-协议)
- [HTTP 服务器请求处理](#http-服务器请求处理)
- [页面呈现](#页面呈现)
  - [浏览器](#浏览器)
  - [HTML 解析](#html-解析)
  - [CSS 解析](#css-解析)
- [页面渲染](#页面渲染)
  - [GPU 渲染](#gpu-渲染)
- [连接关闭](#连接关闭)

<!-- /code_chunk_output -->

## 解析 URL

- 浏览器通过 URL 能够知道下面的信息：

  - `Protocol` "http"
    使用 HTTP 协议
  - `Resource` "/"
    请求的资源是主页(index)

## 输入的是 URL 还是搜索的关键字？

当协议或主机名不合法时，浏览器会将地址栏中输入的文字传给默认的搜索引擎。大部分情况下，在把文字传递给搜索引擎的时候，`URL` 会带有特定的一串字符，用来告诉搜索引擎这次搜索来自这个特定浏览器。

## 转换非 ASCII 的 Unicode 字符

- 浏览器检查输入是否含有不是 `a-z`， `A-Z`，`0-9`， `-` 或者 `.` 的字符
- 这里主机名是 `google.com` ，所以没有非 `ASCII` 的字符；如果有的话，浏览器会对主机名部分使用 `Punycode` 编码

## 检查 HSTS 列表

- 浏览器检查自带的“预加载 HSTS（HTTP 严格传输安全）”列表，这个列表里包含了那些请求浏览器只使用 `HTTPS` 进行连接的网站
- 如果网站在这个列表里，浏览器会使用 `HTTPS` 而不是 HTTP 协议，否则，最初的请求会使用 `HTTP` 协议发送
- 注意，一个网站哪怕不在 `HSTS` 列表里，也可以要求浏览器对自己使用 `HSTS` 政策进行访问。浏览器向网站发出第一个 `HTTP` 请求之后，网站会返回浏览器一个响应，请求浏览器只使用 `HTTPS` 发送请求。然而，就是这第一个 `HTTP` 请求，却可能会使用户受到 `downgrade attack` 的威胁，这也是为什么现代浏览器都预置了 `HSTS` 列表。

## DNS 查询

1. **浏览器缓存**: 首先会向浏览器的缓存中读取上一次访问的记录，在 `chrome` 可以通过地址栏中输入 `chrome://net-internals/#dns` 查看缓存的当前状态
2. **操作系统缓存**：查找存储在系统运行内存中的缓存。在 mac 中可以通过下面的命令清除系统中的 `DNS` 缓存。

3. **在 `host` 文件中查找**：如果在缓存中都查找不到的情况下，就会读取系统中预设的 `host` 文件中的设置。
4. **路由器缓存**：有些路由器也有 `DNS` 缓存的功能，访问过的域名会存在路由器上。

5. **ISP DNS 缓存**：互联网服务提供商（如中国电信）也会提供 DNS 服务，比如比较著名的 `114.114.114.114`，在本地查找不到的情况下，就会向 `ISP` 进行查询，`ISP` 会在当前服务器的缓存内查找是否有记录，如果有，则返回这个 IP，若没有，则会开始向根域名服务器请求查询。
6. **顶级 DNS 服务器/根 `DNS` 服务器**：根域名收到请求后，会判别这个域名(.com)是授权给哪台服务器管理,并返回这个顶级 `DNS` 服务器的 `IP`。请求者收到这台顶级 `DNS` 的服务器 `IP` 后，会向该服务器发起查询，如果该服务器无法解析，该服务器就会返回下一级的 `DNS` 服务器 `IP`（nicefilm.com），本机继续查找，直到服务器找到(www.nicefilm.com)的主机。

## ARP 过程

ARP（Address Resolution Protocol）即地址解析协议， 用于实现从 `IP` 地址到 `MAC` 地址的映射，即询问目标 `IP` 对应的 `MAC` 地址。

要想发送 `ARP`（地址解析协议）广播，我们需要有一个目标 `IP` 地址，同时还需要知道用于发送 `ARP` 广播的接口的 `MAC` 地址。

1.  首先查询 `ARP` 缓存，如果缓存命中，我们返回结果：目标 `IP = MAC`

2.  如果缓存没有命中：

    - 查看路由表，看看目标 `IP` 地址是不是在本地路由表中的某个子网内。是的话，使用跟那个子网相连的接口，否则使用与默认网关相连的接口。
    - 查询选择的网络接口的 `MAC` 地址

3。 收到 `ARP` 响应报文后，将目的 `MAC` 地址加入到自己的 `ARP` 表中以用于后续报文的转发，同时将 `IP` 数据包进行封装后发送出去。

## TCP 三次握手

当浏览器得到了目标服务器的 `IP` 地址，以及 `URL` 中给出来端口号（http 协议默认端口号是 `80`， `https` 默认端口号是 443），它会调用系统库函数 `socket` ，请求一个
`TCP` 流套接字，对应的参数是 `AF_INET/AF_INET6` 和 `SOCK_STREAM` 。

- 这个请求首先被交给传输层，在传输层请求被封装成 TCP segment。目标端口会被加入头部，源端口会在系统内核的动态端口范围内选取（Linux 下是 ip_local_port_range)
- TCP segment 被送往网络层，网络层会在其中再加入一个 IP 头部，里面包含了目标服务器的 IP 地址以及本机的 IP 地址，把它封装成一个 IP packet。
- 这个 `TCP packet` 接下来会进入链路层，链路层会在封包中加入 frame 头部，里面包含了本地内置网卡的 `MAC` 地址以及网关（本地路由器）的 MAC 地址。像前面说的一样，如果内核不知道网关的 `MAC` 地址，它必须进行 ARP 广播来查询其地址。

到了现在，TCP 封包已经准备好了，浏览器通过操作 OS 的 socket 与服务器进行 TCP 连接，这个连接就是我们所熟知的**TCP 三次握手**

- 第一次，本机将标识位 SYN 置为 1, seq = x(Sequence number)发送给服务端。此时本机状态为 SYN-SENT
- 第二次，服务器收到包之后，将状态切换为 **SYN-RECEIVED**，并将标识位 SYN 和 ACK 都置为 1, seq = y, ack = x + 1, 并发送给客户端。
- 第三次，客户端收到包后，将状态切换为 **ESTABLISHED**，并将标识位 ACK 置为 1，seq = x + 1, ack = y + 1, 并发送给服务端。服务端收到包之后，也将状态切换为 **ESTABLISHED**。
  **需要注意的一点是，有一些文章对 ACK 标识位 和 ack（Acknowledgement Number）的解释比较模糊，有一些画图的时候干脆就写在一起了。虽然这两者有关联，但不是同一个东西，搞清楚这个误区可以更方便去理解。还有一些会把第二次握手描述成两个包（比如某百科……），实际上这也是不正确的**

- 标识位 ACK 置为 1 表示我已确认收到 seq 为 x 的包，并回复确认序号 ack = x + 1
- 而 SYN 表示这是我第一次随机生成 seq 的序列 x，此后我每次发送的包都会在上一次发送的基础上增加 y（有数据的时候，y 是数据的长度，没有的时候 y = 1）。**所以，当 seq 已初始化完成之后，没必要再把 SYN 置为 1**

## TLS 握手

- 客户端发送一个 `ClientHello` 消息到服务器端，消息中同时包含了它的 Transport Layer Security (TLS) 版本，可用的加密算法和压缩算法。
- 服务器端向客户端返回一个 `ServerHello` 消息，消息中包含了服务器端的 TLS 版本，服务器所选择的加密和压缩算法，以及数字证书认证机构（Certificate Authority，缩写 CA）签发的服务器公开证书，证书中包含了公钥。客户端会使用这个公钥加密接下来的握手过程，直到协商生成一个新的对称密钥
- 客户端根据自己的信任 CA 列表，验证服务器端的证书是否可信。如果认为可信，客户端会生成一串伪随机数，使用服务器的公钥加密它。这串随机数会被用于生成新的对称密钥
- 服务器端使用自己的私钥解密上面提到的随机数，然后使用这串随机数生成自己的对称主密钥
- 客户端发送一个 `Finished` 消息给服务器端，使用对称密钥加密这次通讯的一个散列值
- 服务器端生成自己的 hash 值，然后解密客户端发送来的信息，检查这两个值是否对应。如果对应，就向客户端发送一个 `Finished` 消息，也使用协商好的对称密钥加密
- 从现在开始，接下来整个 TLS 会话都使用对称秘钥进行加密，传输应用层（HTTP）内容

## HTTP 协议

如果浏览器是 Google 出品的，它不会使用 HTTP 协议来获取页面信息，而是会与服务器端发送请求，商讨使用 SPDY 协议。

如果浏览器使用 HTTP 协议而不支持 SPDY 协议，它会向服务器发送这样的一个请求::

    GET / HTTP/1.1
    Host: google.com
    Connection: close
    [其他头部]

“其他头部”包含了一系列的由冒号分割开的键值对，它们的格式符合 HTTP 协议标准，它们之间由一个换行符分割开来。（这里我们假设浏览器没有违反 HTTP 协议标准的 bug，同时假设浏览器使用 `HTTP/1.1` 协议，不然的话头部可能不包含 `Host` 字段，同时 `GET` 请求中的版本号会变成 `HTTP/1.0` 或者 `HTTP/0.9` 。）

`HTTP/1.1` 定义了“关闭连接”的选项 "close"，发送者使用这个选项指示这次连接在响应结束之后会断开。例如：

    Connection:close

不支持持久连接的 `HTTP/1.1` 应用必须在每条消息中都包含 "close" 选项。

在发送完这些请求和头部之后，浏览器发送一个换行符，表示要发送的内容已经结束了。

服务器端返回一个响应码，指示这次请求的状态，响应的形式是这样的::

    200 OK
    [响应头部]

然后是一个换行，接下来有效载荷(payload)，也就是 `www.google.com` 的 HTML 内容。服务器下面可能会关闭连接，如果客户端请求保持连接的话，服务器端会保持连接打开，以供之后的请求重用。

如果浏览器发送的 `HTTP` 头部包含了足够多的信息（例如包含了 `Etag` 头部），以至于服务器可以判断出，浏览器缓存的文件版本自从上次获取之后没有再更改过，服务器可能会返回这样的响应::

    304 Not Modified
    [响应头部]

这个响应没有有效载荷，浏览器会从自己的缓存中取出想要的内容。

在解析完 `HTML` 之后，浏览器和客户端会重复上面的过程，直到 `HTML` 页面引入的所有资源（图片，`CSS`，`favicon.ico` 等等）全部都获取完毕，区别只是头部的 `GET / HTTP/1.1` 会变成 `GET /$(相对www.google.com的URL) HTTP/1.1` 。

如果 HTML 引入了 `www.google.com` 域名之外的资源，浏览器会回到上面解析域名那一步，按照下面的步骤往下一步一步执行，请求中的 `Host` 头部会变成另外的域名。

## HTTP 服务器请求处理

HTTPD(HTTP Daemon)在服务器端处理请求/响应。最常见的 HTTPD 有 Linux 上常用的 Apache 和 nginx，以及 Windows 上的 IIS。

- HTTPD 接收请求
- 服务器把请求拆分为以下几个参数：
  - HTTP 请求方法(`GET`, `POST`, `HEAD`, `PUT`, `DELETE`, `CONNECT`, `OPTIONS`, 或者 `TRACE`)。直接在地址栏中输入 URL 这种情况下，使用的是 GET 方法
  - 域名：google.com
  - 请求路径/页面：/ (我们没有请求 `google.com` 下的指定的页面，因此 / 是默认的路径)
- 服务器验证其上已经配置了 `google.com` 的虚拟主机
- 服务器验证 google.com 接受 GET 方法
- 服务器验证该用户可以使用 `GET` 方法(根据 `IP` 地址，身份信息等)
- 如果服务器安装了 `URL` 重写模块（例如 `Apache` 的 mod_rewrite 和 IIS 的 URL Rewrite），服务器会尝试匹配重写规则，如果匹配上的话，服务器会按照规则重写这个请求
- 服务器根据请求信息获取相应的响应内容，这种情况下由于访问路径是 "/" ,会访问首页文件（你可以重写这个规则，但是这个是最常用的）。
- 服务器会使用指定的处理程序分析处理这个文件，假如 Google 使用 PHP，服务器会使用 PHP 解析 index 文件，并捕获输出，把 PHP 的输出结果返回给请求者

## 页面呈现

当服务器提供了资源之后（HTML，CSS，JS，图片等），浏览器会执行下面的操作：

- 解析 —— HTML，CSS，JS
- 渲染 —— 构建 DOM 树 -> 渲染 -> 布局 -> 绘制

至此浏览器已经拿到了一个 `HTML` 文档，并为了呈现文档而开始解析。呈现引擎开始工作，基本流程如下（以 webkit 为例）

- 通过 `HTML` 解析器解析 `HTML` 文档，构建一个 `DOM Tree`，同时通过 `CSS` 解析器解析 `HTML` 中存在的 `CSS`，构建 `Style Rules`，两者结合形成一个 `Attachment`。
- 通过 `Attachment` 构造出一个呈现树（`Render Tree`）
- `Render Tree` 构建完毕，进入到布局阶段（`layout`/`reflow`），将会为每个阶段分配一个应出现在屏幕上的确切坐标。
- 最后将全部的节点遍历绘制出来后，一个页面就展现出来了。

### 浏览器

浏览器的功能是从服务器上取回你想要的资源，然后展示在浏览器窗口当中。资源通常是 `HTML` 文件，也可能是 `PDF`，图片，或者其他类型的内容。资源的位置通过用户提供的 URI(Uniform Resource Identifier) 来确定。

浏览器解释和展示 `HTML` 文件的方法，在 `HTML` 和 `CSS` 的标准中有详细介绍。这些标准由 `Web` 标准组织 W3C(World Wide Web Consortium) 维护。

不同浏览器的用户界面大都十分接近，有很多共同的 UI 元素：

- 一个地址栏
- 后退和前进按钮
- 书签选项
- 刷新和停止按钮
- 主页按钮

**浏览器高层架构**

组成浏览器的组件有：

- **用户界面** 用户界面包含了地址栏，前进后退按钮，书签菜单等等，除了请求页面之外所有你看到的内容都是用户界面的一部分
- **浏览器引擎** 浏览器引擎负责让 `UI` 和渲染引擎协调工作
- **渲染引擎** 渲染引擎负责展示请求内容。如果请求的内容是 HTML，渲染引擎会解析 HTML 和 CSS，然后将内容展示在屏幕上
- **网络组件** 网络组件负责网络调用，例如 HTTP 请求等，使用一个平台无关接口，下层是针对不同平台的具体实现
- **UI 后端** UI 后端用于绘制基本 UI 组件，例如下拉列表框和窗口。UI 后端暴露一个统一的平台无关的接口，下层使用操作系统的 UI 方法实现
- **Javascript 引擎** Javascript 引擎用于解析和执行 Javascript 代码
- **数据存储** 数据存储组件是一个持久层。浏览器可能需要在本地存储各种各样的数据，例如 `Cookie` 等。浏览器也需要支持诸如 `localStorage`，IndexedDB，WebSQL 和 FileSystem 之类的存储机制

### HTML 解析

浏览器渲染引擎从网络层取得请求的文档，一般情况下文档会分成 8kB 大小的分块传输。

`HTML` 解析器的主要工作是对 `HTML` 文档进行解析，生成解析树。

解析树是以 `DOM` 元素以及属性为节点的树。`DOM` 是文档对象模型(Document Object Model)的缩写，它是 `HTML` 文档的对象表示，同时也是 `HTML` 元素面向外部(如 Javascript)的接口。树的根部是"Document"对象。整个 DOM 和 HTML 文档几乎是一对一的关系。

**解析算法**

`HTML` 不能使用常见的自顶向下或自底向上方法来进行分析。主要原因有以下几点:

- 语言本身的“宽容”特性
- HTML 本身可能是残缺的，对于常见的残缺，浏览器需要有传统的容错机制来支持它们
- 解析过程需要反复。对于其他语言来说，源码不会在解析过程中发生变化，但是对于 `HTML` 来说，动态代码，例如脚本元素中包含的 `document.write()` 方法会在源码中添加内容，也就是说，解析过程实际上会改变输入的内容

由于不能使用常用的解析技术，浏览器创造了专门用于解析 `HTML` 的解析器。解析算法在 `HTML5` 标准规范中有详细介绍，算法主要包含了两个阶段：标记化（tokenization）和树的构建。

**解析结束之后**

浏览器开始加载网页的外部资源（CSS，图像，Javascript 文件等）。

此时浏览器把文档标记为可交互的（interactive），浏览器开始解析处于“推迟（deferred）”模式的脚本，也就是那些需要在文档解析完毕之后再执行的脚本。之后文档的状态会变为“完成（complete）”，浏览器会触发“加载（load）”事件。

注意解析 HTML 网页时永远不会出现“无效语法（Invalid Syntax）”错误，浏览器会修复所有错误内容，然后继续解析。

### CSS 解析

- 根据 `CSS` 词法和句法 分析 `CSS` 文件和 `<style>` 标签包含的内容以及 `style` 属性的值
- 每个 `CSS` 文件都被解析成一个样式表对象（`StyleSheet object`），这个对象里包含了带有选择器的 `CSS` 规则，和对应 `CSS` 语法的对象
- `CSS` 解析器可能是自顶向下的，也可能是使用解析器生成器生成的自底向上的解析器

## 页面渲染

- 通过遍历 `DOM` 节点树创建一个“Frame 树”或“渲染树”，并计算每个节点的各个 CSS 样式值
- 通过累加子节点的宽度，该节点的水平内边距(padding)、边框(border)和外边距(margin)，自底向上的计算"Frame 树"中每个节点的首选(preferred)宽度
- 通过自顶向下的给每个节点的子节点分配可行宽度，计算每个节点的实际宽度
- 通过应用文字折行、累加子节点的高度和此节点的内边距(padding)、边框(border)和外边距(margin)，自底向上的计算每个节点的高度
- 使用上面的计算结果构建每个节点的坐标
- 当存在元素使用 `floated`，位置有 `absolutely` 或 `relatively` 属性的时候，会有更多复杂的计算，详见http://dev.w3.org/csswg/css2/ 和 http://www.w3.org/Style/CSS/current-work
- 创建 layer(层)来表示页面中的哪些部分可以成组的被绘制，而不用被重新栅格化处理。每个帧对象都被分配给一个层
- 页面上的每个层都被分配了纹理(?)
- 每个层的帧对象都会被遍历，计算机执行绘图命令绘制各个层，此过程可能由 CPU 执行栅格化处理，或者直接通过 D2D/SkiaGL 在 GPU 上绘制
- 上面所有步骤都可能利用到最近一次页面渲染时计算出来的各个值，这样可以减少不少计算量
- 计算出各个层的最终位置，一组命令由 Direct3D/OpenGL 发出，GPU 命令缓冲区清空，命令传至 GPU 并异步渲染，帧被送到 Window Server。

### GPU 渲染

- 在渲染过程中，图形处理层可能使用通用用途的 `CPU`，也可能使用图形处理器 `GPU`
- 当使用 `GPU` 用于图形渲染时，图形驱动软件会把任务分成多个部分，这样可以充分利用 `GPU` 强大的并行计算能力，用于在渲染过程中进行大量的浮点计算。

## 连接关闭

现在的页面为了优化请求的耗时，默认都会开启持久连接（keep-alive），那么一个 `TCP` 连接确切关闭的时机，是这个 `tab` 标签页关闭的时候。这个关闭的过程就是著名的四次挥手。关闭是一个全双工的过程，发包的顺序的不一定的。一般来说是客户端主动发起的关闭，过程如下。

假如最后一次客户端发出的数据 seq = x, ack = y;

1. 客户端发送一个 FIN 置为 1 的包，ack = y， seq = x + 1，此时客户端的状态为 **FIN_WAIT_1**
2. 服务端收到包后，状态切换为 **CLOSE_WAIT** 发送一个 ACK 为 1 的包， ack = x + 2。客户端收到包之后状态切换为 **FNI_WAIT_2**
3. 服务端处理完任务后，向客户端发送一个 FIN 包，seq = y; 同时将自己的状态置为 **LAST_ACK**
4. 客户端收到包后状态切换为 **TIME_WAIT**，并向服务端发送 ACK 包，ack = y + 1，等待 2MSL 后关闭连接。

为什么客户端等待 2MSL？

MSL: 全程 Maximum Segment Lifetime，中文可以翻译为报文最大生存时间。
等待是为了保证连接的可靠性，确保服务端收到 ACK 包，如果服务端没有收到这个 ACK 包，将会重发 FIN 包给客户端，而这个时间刚好是服务端等待超时重发的时间 + FIN 的传输时间。
