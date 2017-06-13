import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './ItemContainer.scss';


class ItemContainer extends Component {

   constructor(props) {
      super(props);
      this.onResize = this.onResize.bind(this);
   }

   /*
    * Called after component rendering to DOM.
    */
   componentDidMount() {
      window.addEventListener('resize', this.onResize);
   }

   /*
    * Called before removing component.
    */
   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
   }

   /*
    * Updates element width on window resize.
    */
   onResize() {
      if (this.width !== null && this.props.onWidth) {
         this.props.onWidth(this.width);
      }
   }

   /*
    * Sets component's DOM element.
    * @param {HTMLElement} el Component's DOM element
    */
   set element(el) {
      this.el = el;

      if (this.width !== null && this.props.onWidth) {
         this.props.onWidth(this.width);
      }
   }

   /*
    * Current element width
    * @returns {number|null}
    */
   get width() {
      return this.el ? this.el.offsetWidth : null;
   }

   /*
    * Renders element.
    * @returns {XML}
    */
   render() {
      return (
         <div
            className={[styles.item, this.props.selected ? styles.selected : ''].join(' ')}
            onClick={this.props.onClick}
            ref={el => (this.element = el)}
         >
            {this.props.children}
            <i className={['KambiWidget-primary-background-color', styles.border].join(' ')} />
         </div>
      );
   }

}

ItemContainer.propTypes = {
   /*
    * On click handler
    */
   onClick: PropTypes.func,

   /*
    * Is this item currently selected?
    */
   selected: PropTypes.bool,

   /*
    * Item contents
    */
   children: PropTypes.node,

   /*
    * Called when item width is known
    */
   onWidth: PropTypes.func
};

export default ItemContainer;
