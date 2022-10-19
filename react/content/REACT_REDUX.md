<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [React-Redux 基础用法](#react-redux-基础用法)
  - [一、UI 组件](#一-ui-组件)
  - [二、容器组件](#二-容器组件)
  - [三、connect()](#三-connect)
  - [四、mapStateToProps()](#四-mapstatetoprops)
  - [五、mapDispatchToProps()](#五-mapdispatchtoprops)
  - [六、<Provider> 组件](#六-provider-组件)
  - [七、实例：计数器](#七-实例计数器)
  - [八、React-Router 路由库](#八-react-router-路由库)
- [React-Redux 原理分析](#react-redux-原理分析)
  - [Provider](#provider)
  - [connect](#connect)
- [Reference:](#reference)

<!-- /code_chunk_output -->

为了方便使用，`Redux` 的作者封装了一个 `React` 专用的库 [React-Redux](https://github.com/reduxjs/react-redux)，本文主要介绍它。

这个库是可以选用的。实际项目中，你应该权衡一下，是直接使用 `Redux`，还是使用 `React-Redux`。后者虽然提供了便利，但是需要掌握额外的 `API`，并且要遵守它的组件拆分规范。

# React-Redux 基础用法

## 一、UI 组件

`React-Redux` 将所有组件分成两大类：UI 组件（presentational component）和容器组件（container component）。

UI 组件有以下几个特征。

- 只负责 `UI` 的呈现，不带有任何业务逻辑
- 没有状态（即不使用 `this.state` 这个变量）
- 所有数据都由参数（`this.props`）提供
- 不使用任何 `Redux` 的 `API`
  下面就是一个 `UI` 组件的例子。

```js
const Title = (value) => <h1>{value}</h1>;
```

因为不含有状态，UI 组件又称为"纯组件"，即它纯函数一样，纯粹由参数决定它的值。

## 二、容器组件

容器组件的特征恰恰相反。

- 负责管理数据和业务逻辑，不负责 `UI` 的呈现
- 带有内部状态
- 使用 `Redux` 的 `API`

总之，只要记住一句话就可以了：`UI` 组件负责 `UI` 的呈现，容器组件负责管理数据和逻辑。

你可能会问，如果一个组件既有 `UI` 又有业务逻辑，那怎么办？回答是，将它拆分成下面的结构：外面是一个容器组件，里面包了一个 `UI` 组件。前者负责与外部的通信，将数据传给后者，由后者渲染出视图。

`React-Redux` 规定，所有的 `UI` 组件都由用户提供，容器组件则是由 `React-Redux` 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。

## 三、connect()

`React-Redux` 提供 `connect` 方法，用于从 UI 组件生成容器组件。`connect` 的意思，就是将这两种组件连起来。

`connect` 是一个高阶函数，首先传入 `mapStateToProps`、`mapDispatchToProps`，然后返回一个生产 `Component` 的函数(wrapWithConnect)，然后再将真正的 `Component` 作为参数传入 `wrapWithConnect(MyComponent)`，这样就生产出一个经过包裹的 `Connect` 组件，该组件具有如下特点:

- 通过 `this.context` 获取祖先 `Component` 的 `store`
- `props` 包括 `stateProps`、`dispatchProps`、`parentProps`,合并在一起得到 `nextState`，作为 `props` 传给真正的 Component
- `componentDidMount` 时，添加事件 `this.store.subscribe(this.handleChange)`，实现页面交互
- `shouldComponentUpdate` 时判断是否有避免进行渲染，提升页面性能，并得到 `nextState`
- `componentWillUnmount` 时移除注册的事件 `this.handleChange`
- 在非生产环境下，带有热重载功能

主要代码逻辑：

```js
export default function connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}) {
  return function wrapWithConnect(WrappedComponent) {
    class Connect extends Component {
      constructor(props, context) {
        // 从祖先Component处获得store
        this.store = props.store || context.store
        this.stateProps = computeStateProps(this.store, props)
        this.dispatchProps = computeDispatchProps(this.store, props)
        this.state = { storeState: null }
        // 对stateProps、dispatchProps、parentProps进行合并
        this.updateState()
      }
      shouldComponentUpdate(nextProps, nextState) {
        // 进行判断，当数据发生改变时，Component重新渲染
        if (propsChanged || mapStateProducedChange || dispatchPropsChanged) {
          this.updateState(nextProps)
            return true
          }
        }
        componentDidMount() {
          // 改变Component的state
          this.store.subscribe(() = {
            this.setState({
              storeState: this.store.getState()
            })
          })
        }
        render() {
          // 生成包裹组件Connect
          return (
            <WrappedComponent {...this.nextState} />
          )
        }
      }
      Connect.contextTypes = {
        store: storeShape
      }
      return Connect;
    }
  }
```

```js
import { connect } from 'react-redux';
const VisibleTodoList = connect()(TodoList);
```

上面代码中，`TodoList` 是 UI 组件，`VisibleTodoList` 就是由 React-Redux 通过 `connect` 方法自动生成的容器组件。

但是，因为没有定义业务逻辑，上面这个容器组件毫无意义，只是 UI 组件的一个单纯的包装层。为了定义业务逻辑，需要给出下面两方面的信息。

1. 输入逻辑：外部的数据（即 `state` 对象）如何转换为 UI 组件的参数

2. 输出逻辑：用户发出的动作如何变为 `Action` 对象，从 UI 组件传出去。

因此，connect 方法的完整 API 如下。

```js
import { connect } from 'react-redux';

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

上面代码中，`connect` 方法接受两个参数：`mapStateToProps` 和 `mapDispatchToProps`。它们定义了 UI 组件的业务逻辑。前者负责输入逻辑，即将 `state` 映射到 UI 组件的参数（`props`），后者负责输出逻辑，即将用户对 UI 组件的操作映射成 Action。

## 四、mapStateToProps()

`mapStateToProps` 是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）`state` 对象到（UI 组件的）`props` 对象的映射关系。

作为函数，`mapStateToProps` 执行后应该返回一个对象，里面的每一个键值对就是一个映射。请看下面的例子。

```js
const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter),
  };
};
```

上面代码中，`mapStateToProps` 是一个函数，它接受 `state` 作为参数，返回一个对象。这个对象有一个 `todos` 属性，代表 UI 组件的同名参数，后面的 `getVisibleTodos` 也是一个函数，可以从 `state` 算出 `todos` 的值。

下面就是 `getVisibleTodos` 的一个例子，用来算出 todos。

```js
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter((t) => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter((t) => !t.completed);
    default:
      throw new Error('Unknown filter: ' + filter);
  }
};
```

`mapStateToProps` 会订阅 Store，每当 `state` 更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。

`mapStateToProps` 的第一个参数总是 `state` 对象，还可以使用第二个参数，代表容器组件的 `props` 对象。

```js
// 容器组件的代码
// <FilterLink filter="SHOW_ALL">
// All
// </FilterLink>

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter,
  };
};
```

使用 `ownProps` 作为参数后，如果容器组件的参数发生变化，也会引发 UI 组件重新渲染。

`connect` 方法可以省略 `mapStateToProps` 参数，那样的话，UI 组件就不会订阅 Store，就是说 Store 的更新不会引起 UI 组件的更新。

## 五、mapDispatchToProps()

`mapDispatchToProps` 是 `connect` 函数的第二个参数，用来建立 UI 组件的参数到 `store.dispatch` 方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。

如果 `mapDispatchToProps` 是一个函数，会得到 `dispatch` 和 `ownProps`（容器组件的 `props` 对象）两个参数。

```js
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter,
      });
    },
  };
};
```

从上面代码可以看到，`mapDispatchToProps` 作为函数，应该返回一个对象，该对象的每个键值对都是一个映射，定义了 UI 组件的参数怎样发出 Action。

如果 `mapDispatchToProps` 是一个对象，它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，返回的 Action 会由 Redux 自动发出。举例来说，上面的 `mapDispatchToProps` 写成对象就是下面这样。

```js
const mapDispatchToProps = {
  onClick: (filter) => {
      type: 'SET_VISIBILITY_FILTER',
      filter: filter
    };
}
```

## 六、<Provider> 组件

`connect` 方法生成容器组件以后，需要让容器组件拿到 `state` 对象，才能生成 UI 组件的参数。

一种解决方法是将 `state` 对象作为参数，传入容器组件。但是，这样做比较麻烦，尤其是容器组件可能在很深的层级，一级级将 state 传下去就很麻烦。

React-Redux 提供 Provider 组件，可以让容器组件拿到 state。

```js
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import todoApp from './reducers';
import App from './components/App';

let store = createStore(todoApp);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

上面代码中，`Provider` 在根组件外面包了一层，这样一来，`App` 的所有子组件就默认都可以拿到 `state` 了。

它的原理是 React 组件的 [`context`](https://reactjs.org/docs/context.html) 属性，请看源码。

```js
class Provider extends Component {
  getChildContext() {
    return {
      store: this.props.store,
    };
  }
  render() {
    return this.props.children;
  }
}

Provider.childContextTypes = {
  store: React.PropTypes.object,
};
```

上面代码中，`store` 放在了上下文对象 `context` 上面。然后，子组件就可以从 `context` 拿到 `store`，代码大致如下。

```js
class VisibleTodoList extends Component {
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  render() {
    const props = this.props;
    const { store } = this.context;
    const state = store.getState();
    // ...
  }
}

VisibleTodoList.contextTypes = {
  store: React.PropTypes.object,
};
```

`React-Redux` 自动生成的容器组件的代码，就类似上面这样，从而拿到 `store`。

## 七、实例：计数器

我们来看一个实例。下面是一个计数器组件，它是一个纯的 UI 组件。

```js
class Counter extends Component {
  render() {
    const { value, onIncreaseClick } = this.props;
    return (
      <div>
        <span>{value}</span>
        <button onClick={onIncreaseClick}>Increase</button>
      </div>
    );
  }
}
```

上面代码中，这个 UI 组件有两个参数：`value` 和 `onIncreaseClick`。前者需要从 `state` 计算得到，后者需要向外发出 Action。

接着，定义 `value` 到 `state` 的映射，以及 `onIncreaseClick` 到 `dispatch` 的映射。

```js
function mapStateToProps(state) {
  return {
    value: state.count,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction),
  };
}

// Action Creator
const increaseAction = { type: 'increase' };
```

然后，使用 `connect` 方法生成容器组件。

```js
const App = connect(mapStateToProps, mapDispatchToProps)(Counter);
```

然后，定义这个组件的 Reducer。

```js
// Reducer
function counter(state = { count: 0 }, action) {
  const count = state.count;
  switch (action.type) {
    case 'increase':
      return { count: count + 1 };
    default:
      return state;
  }
}
```

最后，生成 store 对象，并使用 Provider 在根组件外面包一层。

```js
import { loadState, saveState } from './localStorage';

const persistedState = loadState();
const store = createStore(todoApp, persistedState);

store.subscribe(
  throttle(() => {
    saveState({
      todos: store.getState().todos,
    });
  }, 1000)
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

完整的代码看[这里](https://github.com/jackielii/simplest-redux-example/blob/master/index.js)。

## 八、React-Router 路由库

使用 `React-Router` 的项目，与其他项目没有不同之处，也是使用 `Provider` 在 `Router` 外面包一层，毕竟 `Provider` 的唯一功能就是传入 `store` 对象。

```js
const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route path='/' component={App} />
    </Router>
  </Provider>
);
```

# React-Redux 原理分析

react-redux
react-redux 是一个轻量级的封装库，核心方法只有两个：

- Provider
- connect

## Provider

完整源码请戳[这里](https://github.com/reduxjs/react-redux/blob/master/src/components/Provider.js)

Provider 模块的功能并不复杂，主要分为以下两点：

- 在原应用组件上包裹一层，使原来整个应用成为 Provider 的子组件
- 接收 Redux 的 store 作为 props，通过 context 对象传递给子孙组件上的 connect

下面看下具体代码：

```js
export default class Provider extends Component {
  getChildContext() {
    return { store: this.store };
  }

  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  render() {
    return Children.only(this.props.children);
  }
}

if (process.env.NODE_NEW !== 'production') {
  Provider.prototype.componentWillReceiveProps = function (nextProps) {
    const { store } = this;
    const { store: nextStore } = nextProps;

    if (store !== nextStore) {
      warnAboutReceivingStore();
    }
  };
}

Provider.propTypes = {
  store: storeShape.isRequired,
  children: PropTypes.element.isRequired,
};

Provider.childrenContextTypes = {
  store: storeShape.isRequired,
};
```

### 封装原应用

[31-34] render 方法中，渲染了其子级元素，使整个应用成为 Provider 的子组件。
1、`this.props.children` 是 react 内置在 `this.props` 上的对象，用于获取当前组件的所有子组件
2、`Children` 为 react 内部定义的顶级对象，该对象上封装了一些方便操作子组件的方法。`Children.only` 用于获取仅有的一个子组件，没有或超过一个均会报错。故需要注意：确保 `Provider` 组件的直接子级为单个封闭元素，切勿多个组件平行放置。

### 传递 store

[26-29] Provider 初始化时，获取到 props 中的 store 对象；
[22-24] 将外部的 store 对象放入 context 对象中，使子孙组件上的 connect 可以直接访问到 context 对象中的 store。
`1、context` 可以使子孙组件直接获取父级组件中的数据或方法，而无需一层一层通过 props 向下传递。`context` 对象相当于一个独立的空间，父组件通过 `getChildContext()`向该空间内写值；定义了 `contextTypes` 验证的子孙组件可以通过 `this.context.xxx`，从 context 对象中读取 xxx 字段的值。

### 小结

而言之，Provider 模块的功能很简单，从最外部封装了整个应用，并向 connect 模块传递 store。
而最核心的功能在 connect 模块中。

## connect

正如这个模块的命名，connect 模块才是真正连接了 React 和 Redux。
现在，我们可以先回想一下 Redux 是怎样运作的：首先需要注册一个全局唯一的 store 对象，用来维护整个应用的 state；当要变更 state 时，我们会 dispatch 一个 action，reducer 根据 action 更新相应的 state。
下面我们再考虑一下使用 react-redux 时，我们做了什么：

```js
import React from "react"
import ReactDOM from "react-dom"
import { bindActionCreators } from "redux"
import {connect} from "react-redux"

class xxxComponent extends React.Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        this.props.aActions.xxx1();
    }
    render (
        <div>
            {this.props.$$aProps}
        </div>
    )
}

export default connect(
    state=>{
        return {
            $$aProps:state.$$aProps,
            $$bProps:state.$$bProps,
            // ...
        }
    },
    dispatch=>{
        return {
            aActions:bindActionCreators(AActions,dispatch),
            bActions:bindActionCreators(BActions,dispatch),
            // ...
        }
    }
)(xxxComponent)
```

通过以上代码，我们可以归纳出以下信息：

1、使用了 react-redux 后，我们导出的对象不再是原先定义的 xxxComponent，而是通过 connect 包裹后的新 React.Component 对象。
connect 执行后返回一个函数（wrapWithConnect），那么其内部势必形成了闭包。而 wrapWithConnect 执行后，必须要返回一个 ReactComponent 对象，才能保证原代码逻辑可以正常运行，而这个 ReactComponent 对象通过 render 原组件，形成对原组件的封装。

2、渲染页面需要 store tree 中的 state 片段，变更 state 需要 dispatch 一个 action，而这两部分，都是从 this.props 获取。故在我们调用 connect 时，作为参数传入的 state 和 action，便在 connect 内部进行合并，通过 props 的方式传递给包裹后的 ReactComponent。
connect 完整函数声明如下：

```js
connect(
    mapStateToProps(state,ownProps)=>stateProps:Object,
    mapDispatchToProps(dispatch, ownProps)=>dispatchProps:Object,
    mergeProps(stateProps, dispatchProps, ownProps)=>props:Object,
    options:Object
)=>(
    component
)=>component
```

再来看下 connect 函数体结构，我们摘取核心步骤进行描述

```js
export default function connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options = {}
) {
  // 参数处理
  // ...
  return function wrapWithConnect(WrappedComponent) {
    class Connect extends Component {
      constructor(props, context) {
        super(props, context);
        this.store = props.store || context.store;
        const storeState = this.store.getState();
        this.state = { storeState };
      }
      // 周期方法及操作方法
      // ...
      render() {
        this.renderedElement = createElement(
          WrappedComponent,
          this.mergedProps //mearge stateProps, dispatchProps, props
        );
        return this.renderedElement;
      }
    }
    return hoistStatics(Connect, WrappedComponent);
  };
}
```

其实已经基本印证了我们的猜测：
1、connect 通过 context 获取 Provider 中的 store，通过 store.getState()获取整个 store tree 上所有 state。
2、connect 模块的返回值 wrapWithConnect 为 function。
3、wrapWithConnect 返回一个 ReactComponent 对象 Connect，Connect 重新 render 外部传入的原组件 WrappedComponent，并把 connect 中传入的 mapStateToProps, mapDispatchToProps 与组件上原有的 props 合并后，通过属性的方式传给 WrappedComponent。

下面我们结合代码进行分析一下每个函数的意义。

### mapStateToProps

`mapStateToProps(state,props)`必须是一个函数。
参数 state 为 store tree 中所有 state，参数 props 为通过组件 Connect 传入的 props。
返回值表示需要 merge 进 props 中的 state。

### mapDispatchToProps

`mapDispatchToProps(dispatch, props)`可以是一个函数，也可以是一个对象。
参数 dispatch 为 `store.dispatch()`函数，参数 props 为通过组件 Connect 传入的 props。
返回值表示需要 merge 进 props 中的 action。

### mergeProps

mergeProps 是一个函数，定义了 mapState,mapDispatch 及 this.props 的合并规则，默认合并规则如下：
`{...parentProps, ...stateProps, ...dispatchProps}`
如果通过 connect 注册了 `mergeProps` 方法，以上代码会使用 `mergeProps` `定义的规则进行合并，mergeProps` 合并后的结果，会通过 props 传入 Connect 组件。

### options

`options`是一个对象，包含`pure`和`withRef`两个属性

- pure

表示是否开启 pure 优化，默认值为 true

- withRef

withRef 用来给包装在里面的组件一个 ref，可以通过 getWrappedInstance 方法来获取这个 ref，默认为 false。

### React 如何响应 store 变化

文章一开始我们也提到 React 其实跟 Redux 没有直接联系，也就是说，Redux 中 dispatch 触发 store tree 中 state 变化，并不会导致 React 重新渲染。
react-redux 才是真正触发 React 重新渲染的模块，那么这一过程是怎样实现的呢？
刚刚提到，connect 模块返回一个 wrapWithConnect 函数，wrapWithConnect 函数中又返回了一个 Connect 组件。Connect 组件的功能有以下两点：
1、包装原组件，将 state 和 action 通过 props 的方式传入到原组件内部
2、监听 store tree 变化，使其包装的原组件可以响应 state 变化

- 如何注册监听

Redux 中，可以通过 `store.subscribe(listener)`注册一个监听器。listener 会在 store tree 更新后执行。

- 何时注册

当 Connect 组件加载到页面后，当前组件开始监听 store tree 变化。

- 何时注销

当当前 Connect 组件销毁后，我们希望其中注册的 listener 也一并销毁，避免性能问题。此时可以在 Connect 的 `componentWillUnmount` 周期函数中执行这一过程。

- 变更处理逻辑

有了触发组件更新的时机，我们下面主要看下，组件是通过何种方式触发重新渲染
Connect 组件在初始化时，就已经在 `this.state` 中缓存了 store tree 中 state 的状态。这两行分别取出当前 state 状态和变更前 state 状态进行比较
最终 store tree 中 state 通过 `this.setState()`更新到 Connect 内部的 state 中，而 `this.setState()`方法正好可以触发 Connect 及其子组件的重新渲染。

### 小结

可以看到，react-redux 的核心功能都在 connect 模块中，理解好这个模块，有助于我们更好的使用 react-redux 处理业务问题，优化代码性能。

# Reference:

[Redux 入门教程（三）：React-Redux 的用法](http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_three_react-redux.html)

[解读 redux 工作原理](http://zhenhua-lee.github.io/react/redux.html)

[react-redux 原理分析](https://www.cnblogs.com/hhhyaaon/p/5863408.html)
