/**
 * Reusable React Components
 * It is not necessary to make the whole widget in React in order to use these components, they can be mixed with non React code as necessary.
 * @example
// this example shows how to use the Header component without using JSX

import React from 'react';
import ReactDOM from 'react-dom';
import { Header } 'kambi-widget-components';

// Basic React API: React.createElement(Component, props, children)

// check widget-components.Header documentation for all the options
const header = React.createElement(
   Header,
   { collapsable: false },
   'This is the Header title'
)

// ReactDOM API: ReactDOM.render(reactElement, HTMLElement)
// places the Header in the page:
ReactDOM.render(header, document.getElementById('header'))

 * @example
// this example shows how to use the Header component using JSX
// note that JSX only works in .jsx files

import React from 'react';
import ReactDOM from 'react-dom';
import { Header } 'kambi-widget-components';
ReactDOM.render(
   <Header collapsable={false}>
      This is the Header title
   </Header>
, document.getElementById('header'))

 * @namespace widget-components
 */

export { default as OutcomeButton } from './OutcomeButton/OutcomeButton';
export { default as OutcomeButtonUI } from './OutcomeButton/OutcomeButtonUI';
export { default as TabPagination } from './TabPagination/TabPagination';
export { default as FixedList } from './List/FixedList/FixedList';
export { default as ScrolledList } from './List/ScrolledList/ScrolledList';
export { default as DropdownButton } from './DropdownButton/DropdownButton';
export { default as Header } from './Header/Header';
