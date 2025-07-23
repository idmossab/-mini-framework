window.onload = () => {
  const appContainer = document.getElementById('app');
  const vdomManager = new VDOMManager(appContainer);

  vdomManager.mount();

  setTimeout(() => {
    vdomManager.setState({ message: "Hello after 2 seconds!" });
  }, 2000);

  setTimeout(() => {
    vdomManager.setState({ message: "Another update after 4 seconds." });
  }, 4000);

  setTimeout(() => {
    const manualVNode = new VNode('div', {}, [
      "This is a manually stored virtual node.",
      new VNode('button', {
        onClick: () => alert("Clicked manual button!")
      }, ['Click me'])
    ]);
    vdomManager.store(manualVNode);
  }, 6000);
};