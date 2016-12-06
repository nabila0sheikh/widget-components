import React, { Component } from 'react';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import styles from './Header.scss';

/**
 * Header component, used to create standard headers, this component changes its default behavior based on coreLibrary.pageInfo.
 * If pageInfo.pageType is "home" the header is white background with grey text, otherwise the widget becomes collapsable and the header becomes black with white text.
 * These defaults are overridable by the props
 * @memberof widget-components
 */
class Header extends Component {

   /*
    * Constructs.
    * @param {object} props Header properties
    */
   constructor ( props ) {
      super(props);
      this.state = {
         hidden: this.props.hidden
      };
      this.toggleHeader = this.toggleHeader.bind(this);
   }

   /*
    * Called after mounting component
    */
   componentDidMount () {
      if ( this.state.hidden ) {
         // Collapse widget if needed by initial state
         widgetModule.setWidgetHeight(Header.HEIGHT);
      }
   }

   /*
    * Collapses or expands the widget
    * @returns {function|null} A callback baes on the action performed or null if no call back was provided
    */
   toggleHeader () {
      this.setState({ hidden: !this.state.hidden });
      if ( this.props.collapsable ) {
         if ( !this.state.hidden ) {
            widgetModule.setWidgetHeight(Header.HEIGHT);
            return ( this.props.onCollapse ) ? this.props.onCollapse() : null;
         }
         widgetModule.adaptWidgetHeight();
         return ( this.props.onExpand ) ? this.props.onExpand() : null;
      }
   }

   /*
    * Creates Header template.
    * @returns {XML}
    */
   render () {
      // Default classes to be added to all headers
      let cssClasses = 'l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color';
      // If we have custom classes disregard default styling and load custom classes
      if ( typeof this.props.customClasses === 'string') {
         cssClasses = this.props.customClasses;
      } else {
         // Add classes depending on pageInfo
         cssClasses += (coreLibrary.pageInfo.pageType === 'home') ? ' l-pt-6 l-pb-6 ' + styles.kwHeader : ' KambiWidget-header l-pt-8 l-pb-8';
      }

      return (
         <header
            className={cssClasses}
            onClick={this.toggleHeader}>
            {this.props.children}
         </header>
      )
   }
}

/**
 * @property children {ReactElement} Elements to be placed inside the header
 * @property [collapsable] {boolean} Sets header as collapsable
 * @property [hidden] {boolean} if true the widget will start collapsed
 * @property [onCollapse] {Function} callback invoked when the widget collapses
 * @property [onExpand] {Function} callback invoked when the widget uncollapses
 * @property [customClasses] {string|boolean} Defaults to false. If provided adds these CSS classes to the header instead of adding classes based on pageInfo
 */
Header.propTypes = {
   children: React.PropTypes.node.isRequired,
   collapsable: React.PropTypes.bool,
   hidden: React.PropTypes.bool,
   onCollapse: React.PropTypes.func,
   onExpand: React.PropTypes.func,
   customClasses: React.PropTypes.string
};

/**
 * Holds the height of the header in pixels
 * @type {number}
 */
Header.HEIGHT = (coreLibrary.pageInfo.pageType === 'home') ? 37 : 40;

export default Header;
