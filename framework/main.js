function renderApp(state, setState) {
  return new VNode('div', {}, [
    new VNode('h1', {}, [`Clicked: ${state.count}`]),
    new VNode('button', {
      onClick: () => {
        console.log("Clicked");  
        state.count = state.count + 1        
        setState({ count: state.count } )
      }
    }, ['clickini a77 '])
  ]);
}

const app = new VDOMManager(document.getElementById('app'), renderApp, { count: 0 });
app.mount();
