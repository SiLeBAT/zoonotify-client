import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/StartPage/App';
import datasets from './datasets'


ReactDOM.render(
  <App name='ZooNotify' datasets={{label: 'Datasets', dataset:datasets}} />,
  document.getElementById('application')
);
