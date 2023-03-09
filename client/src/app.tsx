import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <>    
    <h1>Hello World!</h1>
    </>
  )
}

export default App;

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <App/>
);